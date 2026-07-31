/** SETTINGS › Billing — usage and cost by provider. */
import { Page, expect, Locator } from "@playwright/test";
import { gotoApp, waitForLoadingToClear } from "../helpers/navigate";
import {
  BILLING_COPY,
  BILLING_USAGE_INTERVALS,
} from "../data/billing-data";

export class BillingPage {
  constructor(private readonly page: Page) {}

  mainPanel(): Locator {
    return this.page.getByRole("main");
  }

  async open() {
    await gotoApp(this.page, "billing");
    await this.expectPageHeader();
  }

  async expectPageHeader() {
    await expect(
      this.page.getByRole("heading", { name: /^Billing$/i }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(this.page.getByText(BILLING_COPY.subtitle).first()).toBeVisible();
  }

  async parseTotalMinutes(): Promise<number> {
    const text = await this.mainPanel().innerText().catch(() => "");
    const match = text.match(/Total minutes[^\d]*([\d.]+)/i);
    return match ? Number.parseFloat(match[1]) : 0;
  }

  /**
   * Wait until usage data finishes loading (provider table or empty-state shown)
   * so the Total minutes figure isn't read while still 0/loading.
   */
  async waitForUsageSettled(): Promise<void> {
    await waitForLoadingToClear(this.page);
    const table = this.mainPanel().getByRole("table");
    const empty = this.page
      .getByText(BILLING_COPY.noUsageInPeriod)
      .or(this.page.getByText(BILLING_COPY.noUsageInWindow));
    await expect(table.or(empty).first()).toBeVisible({ timeout: 20_000 });
  }

  /** Total minutes read only after usage has settled — safe for baseline captures. */
  async readTotalMinutes(): Promise<number> {
    await this.waitForUsageSettled();
    return this.parseTotalMinutes();
  }

  async isEmptyState(): Promise<boolean> {
    await this.waitForUsageSettled();
    const noUsage = await this.page
      .getByText(BILLING_COPY.noUsageInPeriod)
      .or(this.page.getByText(BILLING_COPY.noUsageInWindow))
      .isVisible({ timeout: 3_000 })
      .catch(() => false);
    if (noUsage) return true;
    return (await this.parseTotalMinutes()) === 0;
  }

  async hasUsageData(): Promise<boolean> {
    if (await this.isEmptyState()) return false;
    return (await this.parseTotalMinutes()) > 0;
  }

  async expectHasUsageData() {
    await this.expectDashboardLoaded();
    expect(await this.parseTotalMinutes()).toBeGreaterThan(0);
  }

  async expectEmptyState() {
    await this.expectPageHeader();
    await this.expectTotalMinutesEmpty();
    await expect(this.page.getByText(BILLING_COPY.noUsageInWindow)).toBeVisible({
      timeout: 15_000,
    });
    await expect(this.page.getByText(BILLING_COPY.noUsageInPeriod)).toBeVisible();
  }

  async expectTotalMinutesEmpty() {
    await expect(this.page.getByText(/Total minutes/i).first()).toBeVisible();
    await expect(this.mainPanel().getByText(/^0\.0$|^0$/).first()).toBeVisible();
  }

  timeRangeSelect(): Locator {
    return this.mainPanel().getByRole("combobox").first();
  }

  timeRangeTrigger(): Locator {
    return this.timeRangeSelect();
  }

  async expectTimeRangeDefault() {
    await expect(this.timeRangeSelect()).toContainText(/This month/i);
  }

  async selectTimeRange(label: string) {
    const select = this.timeRangeSelect();
    await expect(select).toBeVisible({ timeout: 10_000 });
    await select.selectOption({ label }).catch(async () => {
      await select.selectOption(label);
    });
  }

  usageIntervalTab(label: string): Locator {
    return this.mainPanel()
      .getByRole("button", { name: new RegExp(`^${label}$`, "i") })
      .first();
  }

  async clickUsageInterval(label: string) {
    await this.usageIntervalTab(label).click();
  }

  async expectUsageIntervalActive(label: string) {
    await expect(this.usageIntervalTab(label)).toBeVisible();
  }

  async expectUsageIntervalsVisible() {
    for (const interval of BILLING_USAGE_INTERVALS) {
      await expect(this.usageIntervalTab(interval)).toBeVisible();
    }
  }

  async expectTimeRangesVisible() {
    await expect(this.timeRangeSelect()).toBeVisible();
  }

  async expectUsageOverTimeSection() {
    await expect(this.page.getByText(BILLING_COPY.usageOverTime).first()).toBeVisible();
    await this.expectUsageIntervalsVisible();
  }

  /** Page shell — works with or without usage data. */
  async expectDashboardLoaded() {
    await this.expectPageHeader();
    await this.expectTimeRangesVisible();
    await this.expectUsageOverTimeSection();
    await expect(this.page.getByText(/Total minutes/i).first()).toBeVisible();
  }

  async expectSidebarLinkVisible() {
    await expect(this.page.getByRole("link", { name: /^Billing$/i })).toBeVisible();
  }
}
