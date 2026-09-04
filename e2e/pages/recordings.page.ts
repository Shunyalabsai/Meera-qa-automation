import { Page, expect, Locator } from "@playwright/test";
import { gotoApp, reloadSpaRoute } from "../helpers/navigate";
import { RECORDINGS_COPY } from "../data/recordings-data";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** ANALYZE › Recordings — browse and search call recordings. */
export class RecordingsPage {
  constructor(private readonly page: Page) {}

  async open() {
    await gotoApp(this.page, "recordings");
    await this.expectPageHeader();
  }

  async expectPageHeader() {
    await expect(
      this.page.getByRole("heading", { name: /^Recordings$/i }),
    ).toBeVisible({ timeout: 30_000 });
  }

  async isEmptyState(): Promise<boolean> {
    return this.page
      .getByText(RECORDINGS_COPY.emptyTitle)
      .isVisible({ timeout: 5_000 })
      .catch(() => false);
  }

  async hasRecordings(): Promise<boolean> {
    if (await this.isEmptyState()) return false;
    return this.recordingsTable()
      .getByRole("row")
      .nth(1)
      .isVisible({ timeout: 5_000 })
      .catch(() => false);
  }

  async expectHasRecordings() {
    await this.expectPageHeader();
    await expect(this.recordingsTable()).toBeVisible();
    await expect(this.recordingsTable().getByRole("row").nth(1)).toBeVisible();
  }

  async expectEmptyState() {
    await this.expectPageHeader();
    await expect(this.page.getByText(RECORDINGS_COPY.emptyTitle)).toBeVisible({
      timeout: 15_000,
    });
  }

  async expectEmptyOrTable() {
    const table = this.page.getByRole("table");
    const emptyTitle = this.page.getByText(RECORDINGS_COPY.emptyTitle);
    const mainLinks = this.page.getByRole("main").getByRole("link");
    const noRecording = this.page.getByText(/No recording available/i);

    const matchFound = await Promise.race([
      table.first().waitFor({ state: "visible", timeout: 20_000 }).then(() => true).catch(() => false),
      emptyTitle.first().waitFor({ state: "visible", timeout: 20_000 }).then(() => true).catch(() => false),
      mainLinks.first().waitFor({ state: "visible", timeout: 20_000 }).then(() => true).catch(() => false),
      noRecording.first().waitFor({ state: "visible", timeout: 20_000 }).then(() => true).catch(() => false),
    ]);

    expect(matchFound, "Expected recordings table, empty state, or call recording list to be visible").toBeTruthy();
  }

  searchInput(): Locator {
    return this.page.getByPlaceholder(RECORDINGS_COPY.searchPlaceholder);
  }

  agentFilterSelect(): Locator {
    return this.page
      .getByRole("main")
      .getByRole("combobox")
      .first()
      .or(
        this.page
          .getByRole("main")
          .locator("select")
          .filter({ has: this.page.locator("option", { hasText: /All agents/i }) }),
      )
      .first();
  }

  agentFilterTrigger(): Locator {
    return this.page
      .getByRole("main")
      .getByRole("combobox", { name: /^Agent/i })
      .or(this.page.getByRole("main").getByRole("button", { name: /^Agent/i }))
      .or(
        this.page.getByRole("main").getByRole("button", {
          name: RECORDINGS_COPY.agentFilterDefault,
        }),
      )
      .or(
        this.page
          .getByRole("main")
          .locator("button")
          .filter({ hasText: /All agents/i }),
      )
      .first();
  }

  async expectAgentFilterVisible() {
    const select = this.agentFilterSelect();
    if (await select.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await expect(select).toBeVisible();
      return;
    }
    await expect(this.agentFilterTrigger()).toBeVisible();
  }

  async expectAgentFilterDefault() {
    const select = this.agentFilterSelect();
    if (await select.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await expect(select).toContainText(/All agents/i);
      return;
    }
    await expect(this.agentFilterTrigger()).toContainText(/All agents/i);
  }

  async selectAgentFilter(value: string) {
    const select = this.agentFilterSelect();
    if (await select.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await select.selectOption({ label: value }).catch(async () => {
        await select.selectOption(value);
      });
      return;
    }

    await this.agentFilterTrigger().click();
    const pattern = new RegExp(`^\\s*${escapeRegExp(value)}\\s*$`, "i");
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

  async search(query: string) {
    const input = this.searchInput();
    await input.fill(query);
    await input.press("Enter");
  }

  async expectSearchAndFilterVisible() {
    await expect(this.searchInput()).toBeVisible();
    await this.expectAgentFilterVisible();
  }

  async reloadAndRecover() {
    await reloadSpaRoute(this.page, "recordings");
  }

  recordingsTable(): Locator {
    return this.page.getByRole("table");
  }
}
