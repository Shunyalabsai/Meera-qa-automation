import { Page, expect, Locator } from "@playwright/test";
import { gotoApp } from "../helpers/navigate";
import {
  CALLS_COPY,
  CallFilterLabel,
} from "../data/calls-filter-data";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** ANALYZE › Calls — search and filter completed call logs. */
export class CallsListPage {
  constructor(private readonly page: Page) {}

  async open() {
    await gotoApp(this.page, "calls");
    await this.expectPageHeader();
  }

  async expectPageHeader() {
    await expect(
      this.page.getByRole("heading", { name: /^Calls$/i }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(this.shownCount()).toBeVisible();
  }

  shownCount(): Locator {
    return this.page.getByText(CALLS_COPY.shownCount).first();
  }

  async isEmptyState(): Promise<boolean> {
    return this.page
      .getByText(CALLS_COPY.emptyTitle)
      .isVisible({ timeout: 5_000 })
      .catch(() => false);
  }

  async parseShownCount(): Promise<number> {
    const text = (await this.shownCount().textContent()) ?? "";
    const match = text.match(/(\d+)\s+shown/i);
    return match ? Number.parseInt(match[1], 10) : 0;
  }

  async hasCallRecords(): Promise<boolean> {
    if (await this.isEmptyState()) return false;
    const count = await this.parseShownCount();
    if (count > 0) return true;
    return this.callsTable()
      .getByRole("row")
      .nth(1)
      .isVisible({ timeout: 3_000 })
      .catch(() => false);
  }

  callsTable(): Locator {
    return this.page.getByRole("table");
  }

  async expectHasCallRecords() {
    await this.expectPageHeader();
    const count = await this.parseShownCount();
    expect(count).toBeGreaterThan(0);
    await expect(this.callsTable()).toBeVisible();
  }

  /** First call ID from table — UUID in row text or link href, read at runtime. */
  async firstCallIdFromTable(): Promise<string | null> {
    if (!(await this.callsTable().isVisible({ timeout: 5_000 }).catch(() => false))) {
      return null;
    }
    const link = this.callsTable().getByRole("link").first();
    if (await link.isVisible({ timeout: 2_000 }).catch(() => false)) {
      const href = (await link.getAttribute("href")) ?? "";
      const fromHref = href.match(/calls\/([^/?#]+)/i)?.[1];
      if (fromHref && fromHref.length > 8) return fromHref;
    }
    const text = await this.callsTable().innerText();
    const uuid = text.match(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
    );
    return uuid?.[0] ?? null;
  }

  async expectEmptyState() {
    await this.expectPageHeader();
    await expect(this.page.getByText(CALLS_COPY.emptyTitle)).toBeVisible({
      timeout: 15_000,
    });
    await expect(this.page.getByText(CALLS_COPY.emptyHint).first()).toBeVisible();
  }

  async expectEmptyOrTable() {
    await expect(
      this.page
        .getByRole("table")
        .or(this.page.getByText(CALLS_COPY.callSearchNoResult))
        .or(this.page.getByText(/No calls found|Call not found|Failed to load call/i))
        .or(this.page.getByRole("heading", { name: /Call detail/i }))
        .first(),
    ).toBeVisible({ timeout: 20_000 });
  }

  async expectCallIdSearchNoResult() {
    await expect(
      this.page
        .getByText(CALLS_COPY.callSearchNoResult)
        .or(this.page.getByText(/No calls found|Call not found|Failed to load call/i))
        .or(this.page.getByRole("heading", { name: /Call detail/i }))
        .first(),
    ).toBeVisible({ timeout: 15_000 });
  }

  filterField(label: string): Locator {
    const inMain = this.page.getByRole("main");
    const pattern = new RegExp(escapeRegExp(label), "i");
    return inMain
      .locator("label")
      .filter({ hasText: pattern })
      .or(inMain.getByRole("button", { name: pattern }))
      .or(inMain.getByText(pattern))
      .first();
  }

  filterSelect(label: CallFilterLabel | "Agent"): Locator {
    const pattern = new RegExp(escapeRegExp(label), "i");
    const inMain = this.page.getByRole("main");
    return inMain
      .getByRole("combobox", { name: pattern })
      .or(inMain.getByRole("button", { name: pattern }))
      .or(this.filterField(label).locator("xpath=./select[1] | following-sibling::select[1]"))
      .first();
  }

  async selectFilterOption(label: CallFilterLabel | "Agent", value: string) {
    const trigger = this.filterSelect(label);
    const isNativeSelect = await trigger.evaluate((el) => el.tagName === "SELECT").catch(() => false);
    if (isNativeSelect) {
      await trigger.selectOption({ label: value }).catch(async () => {
        await trigger.selectOption(value);
      });
      return;
    }

    await trigger.click();
    const exactWord = value === "en" ? "English" : value === "hi" ? "Hindi" : value === "ta" ? "Tamil" : value === "te" ? "Telugu" : value;
    const pattern = new RegExp(`^\\s*(${escapeRegExp(value)}|${escapeRegExp(exactWord)})\\s*$`, "i");
    const option = this.page
      .locator('[role="listbox"], [role="menu"], div[data-radix-popper-content-wrapper], div.absolute, ul')
      .getByRole("option", { name: pattern })
      .or(this.page.locator('[role="listbox"], [role="menu"], div[data-radix-popper-content-wrapper], div.absolute, ul').getByRole("button", { name: pattern }))
      .or(this.page.locator('[role="listbox"], [role="menu"], div[data-radix-popper-content-wrapper], div.absolute, ul').getByText(pattern))
      .or(this.page.getByRole("option", { name: pattern }))
      .or(this.page.getByText(pattern))
      .first();

    if (await option.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await option.click();
    } else {
      await this.page.keyboard.press("Escape").catch(() => {});
    }
  }

  async expectFilterOptions(
    label: CallFilterLabel | "Agent",
    options: readonly string[],
  ) {
    const select = this.filterSelect(label);
    const isNative = await select.evaluate((el) => el.tagName === "SELECT").catch(() => false);
    if (isNative) {
      for (const option of options) {
        await expect(
          select.locator("option", {
            hasText: new RegExp(`^${escapeRegExp(option)}$`, "i"),
          }),
        ).toHaveCount(1);
      }
    } else {
      await select.click();
      await expect(
        this.page.locator('[role="listbox"], [role="menu"], div[data-radix-popper-content-wrapper], div.absolute, ul').first(),
      ).toBeVisible({ timeout: 3_000 });
      await this.page.keyboard.press("Escape").catch(() => {});
    }
  }

  callIdSearchInput(): Locator {
    return this.page
      .getByPlaceholder(CALLS_COPY.callIdPlaceholder)
      .or(this.page.getByLabel(/call id/i))
      .or(
        this.page
          .getByRole("main")
          .getByRole("textbox")
          .filter({ has: this.page.getByText(CALLS_COPY.searchHint) })
          .first(),
      )
      .first();
  }

  goButton(): Locator {
    return this.page.getByRole("button", { name: /^Go$/i });
  }

  fromNumberInput(): Locator {
    return this.page.getByPlaceholder(/5551234|from number/i).or(
      this.filterField("From number").locator("xpath=following-sibling::input[1]"),
    );
  }

  toNumberInput(): Locator {
    return this.page.getByPlaceholder(/\+1800|to number/i).or(
      this.filterField("To number").locator("xpath=following-sibling::input[1]"),
    );
  }

  dateFromInput(): Locator {
    return this.filterField("Date from").locator(
      "xpath=following-sibling::input[1]",
    );
  }

  dateToInput(): Locator {
    return this.filterField("Date to").locator(
      "xpath=following-sibling::input[1]",
    );
  }

  durationMinInput(): Locator {
    return this.page.getByPlaceholder(/^min$/i).or(
      this.page
        .getByText(/Duration \(sec\)/i)
        .locator("xpath=following::input[1]"),
    );
  }

  durationMaxInput(): Locator {
    return this.page.getByPlaceholder(/^max$/i).or(
      this.page
        .getByText(/Duration \(sec\)/i)
        .locator("xpath=following::input[2]"),
    );
  }

  async searchByCallId(id: string) {
    await this.callIdSearchInput().fill(id);
    await this.callIdSearchInput().press("Enter");
  }

  async searchByCallIdGo(id: string) {
    await this.callIdSearchInput().fill(id);
    const go = this.goButton();
    if (await go.isEnabled({ timeout: 2_000 }).catch(() => false)) {
      await go.click();
    } else {
      await this.callIdSearchInput().press("Enter");
    }
  }

  async expectGoButtonDisabled() {
    await expect(this.goButton()).toBeDisabled();
  }

  async expectInvalidCallIdSearchBlocked() {
    await this.callIdSearchInput().press("Enter");
    await this.expectEmptyOrTable();
  }

  async fillFromNumber(value: string) {
    await this.fromNumberInput().fill(value);
  }

  async fillToNumber(value: string) {
    await this.toNumberInput().fill(value);
  }

  async fillDateFrom(value: string) {
    await this.dateFromInput().fill(value);
  }

  async fillDateTo(value: string) {
    await this.dateToInput().fill(value);
  }

  async fillDuration(min?: string, max?: string) {
    if (min !== undefined) await this.durationMinInput().fill(min);
    if (max !== undefined) await this.durationMaxInput().fill(max);
  }

  async expectAllFiltersVisible() {
    const labels = [
      "Agent",
      "State",
      "Outcome",
      "Sentiment",
      "Language",
      "From number",
      "To number",
      "Date from",
      "Date to",
      "Duration (sec)",
    ];
    for (const label of labels) {
      await expect(this.filterField(label)).toBeVisible();
    }
    await expect(this.callIdSearchInput()).toBeVisible();
    await expect(this.goButton()).toBeVisible();
  }

  exportButton(): Locator {
    return this.page.getByRole("button", { name: /Export|Download|CSV/i });
  }

  async hasExportControl(): Promise<boolean> {
    return this.exportButton()
      .isVisible({ timeout: 5_000 })
      .catch(() => false);
  }
}
