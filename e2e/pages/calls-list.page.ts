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
        .or(this.page.getByText(CALLS_COPY.callSearchNoResult)),
    ).toBeVisible({ timeout: 20_000 });
  }

  async expectCallIdSearchNoResult() {
    await expect(
      this.page.getByText(CALLS_COPY.callSearchNoResult).first(),
    ).toBeVisible({ timeout: 15_000 });
  }

  filterField(label: string): Locator {
    const inMain = this.page.getByRole("main");
    const pattern = new RegExp(`^${escapeRegExp(label)}$`, "i");
    const asLabel = inMain.locator("label").filter({ hasText: pattern }).first();
    // Duration is plain text in the filter bar, not a <label>.
    if (/^Duration \(sec\)$/i.test(label)) {
      return asLabel.or(inMain.getByText(pattern).first());
    }
    return asLabel;
  }

  filterCombobox(label: string) {
    return this.filterField(label).locator(
      "xpath=following-sibling::select[1] | following-sibling::*[1]//select | following-sibling::*[1]",
    );
  }

  filterSelect(label: CallFilterLabel | "Agent"): Locator {
    const field = this.filterField(label);
    return field.locator("xpath=following-sibling::select[1]");
  }

  async selectFilterOption(label: CallFilterLabel | "Agent", value: string) {
    const select = this.filterSelect(label);
    if (await select.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await select.selectOption({ label: value }).catch(async () => {
        await select.selectOption(value);
      });
      return;
    }

    const trigger = this.filterField(label)
      .locator("xpath=following-sibling::*[1]")
      .getByRole("combobox")
      .or(
        this.filterField(label)
          .locator("xpath=following-sibling::*[1]")
          .getByRole("button"),
      )
      .first();
    await trigger.click();
    await this.page
      .getByRole("option", { name: new RegExp(`^${value}$`, "i") })
      .or(this.page.getByRole("menuitem", { name: new RegExp(`^${value}$`, "i") }))
      .first()
      .click();
  }

  async expectFilterOptions(
    label: CallFilterLabel | "Agent",
    options: readonly string[],
  ) {
    const select = this.filterSelect(label);
    for (const option of options) {
      await expect(
        select.locator("option", {
          hasText: new RegExp(`^${option}$`, "i"),
        }),
      ).toHaveCount(1);
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
    await this.expectGoButtonDisabled();
    await this.callIdSearchInput().press("Enter");
    await this.expectPageHeader();
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
}
