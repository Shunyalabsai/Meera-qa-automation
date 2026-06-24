import { Page, expect, Locator } from "@playwright/test";
import { gotoApp } from "../helpers/navigate";
import { LIVE_CALLS_COPY } from "../data/live-calls-data";

/** RUN › Live Calls — real-time in-flight call monitoring. */
export class LiveCallsPage {
  constructor(private readonly page: Page) {}

  async open() {
    await gotoApp(this.page, "live-calls");
    await this.expectPageHeader();
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
    return this.page
      .getByText(LIVE_CALLS_COPY.emptyTitle)
      .isVisible({ timeout: 5_000 })
      .catch(() => false);
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
