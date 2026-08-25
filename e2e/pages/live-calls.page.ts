import { Page, expect, Locator } from "@playwright/test";
import { gotoApp, waitForLoadingToClear } from "../helpers/navigate";
import { LIVE_CALLS_COPY } from "../data/live-calls-data";

/** RUN › Live Calls — real-time in-flight call monitoring. */
export class LiveCallsPage {
  constructor(private readonly page: Page) {}

  async open() {
    await gotoApp(this.page, "live-calls");
    await this.expectPageHeader();
    await waitForLoadingToClear(this.page);
  }

  async expectPageHeader() {
    await expect(
      this.page.getByRole("heading", { name: /Live Calls/i }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      this.page.getByText(LIVE_CALLS_COPY.subtitle).first(),
    ).toBeVisible();
  }

  async isEmptyState(): Promise<boolean> {
    await waitForLoadingToClear(this.page);
    const empty = await this.page
      .getByText(LIVE_CALLS_COPY.emptyTitle)
      .isVisible({ timeout: 5_000 })
      .catch(() => false);
    if (empty) return true;
    const hasTable = await this.callsTable()
      .isVisible({ timeout: 3_000 })
      .catch(() => false);
    return !hasTable;
  }

  async expectEmptyState() {
    await this.expectPageHeader();
    await expect(this.page.getByText(LIVE_CALLS_COPY.emptyTitle)).toBeVisible({
      timeout: 15_000,
    });
    await expect(this.page.getByText(LIVE_CALLS_COPY.emptyHint).first()).toBeVisible();
    await expect(this.page.getByText(LIVE_CALLS_COPY.apiHint).first()).toBeVisible();
  }

  playgroundLink(): Locator {
    return this.page.getByRole("link", { name: /Playground/i });
  }

  callsTable(): Locator {
    return this.page.getByRole("table");
  }

  callRows(): Locator {
    return this.page.locator("tbody tr, [role='row']").filter({
      hasNot: this.page.getByRole("columnheader"),
    });
  }

  async expectNoActiveCallRows() {
    const table = this.callsTable();
    if (await table.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await expect(this.callRows()).toHaveCount(0);
    }
  }
}
