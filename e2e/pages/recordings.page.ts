import { Page, expect, Locator } from "@playwright/test";
import { gotoApp, reloadSpaRoute } from "../helpers/navigate";
import { RECORDINGS_COPY } from "../data/recordings-data";

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

  async expectEmptyState() {
    await this.expectPageHeader();
    await expect(this.page.getByText(RECORDINGS_COPY.emptyTitle)).toBeVisible({
      timeout: 15_000,
    });
  }

  async expectEmptyOrTable() {
    await expect(
      this.page
        .getByRole("table")
        .or(this.page.getByText(RECORDINGS_COPY.emptyTitle)),
    ).toBeVisible({ timeout: 20_000 });
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
      .getByRole("combobox")
      .or(
        this.page.getByRole("main").getByRole("button", {
          name: RECORDINGS_COPY.agentFilterDefault,
        }),
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
    await this.page
      .getByRole("option", { name: new RegExp(`^${value}$`, "i") })
      .or(
        this.page.getByRole("menuitem", {
          name: new RegExp(`^${value}$`, "i"),
        }),
      )
      .first()
      .click();
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
