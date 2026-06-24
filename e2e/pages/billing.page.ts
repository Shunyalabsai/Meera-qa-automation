/** SETTINGS › Billing — usage and cost by provider. */
import { Page, expect, Locator } from "@playwright/test";
import { gotoApp } from "../helpers/navigate";
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

  async isEmptyState(): Promise<boolean> {
    const noUsage = await this.page
      .getByText(BILLING_COPY.noUsageInPeriod)
      .or(this.page.getByText(BILLING_COPY.noUsageInWindow))
      .isVisible({ timeout: 3_000 })
      .catch(() => false);
    if (noUsage) return true;

    const minutesText = await this.mainPanel()
      .getByText(/Total minutes/i)
      .locator("xpath=following::*[1]")
      .first()
      .textContent()
      .catch(() => "");
    return /^0\.0$|^0$/.test(minutesText?.trim() ?? "");
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

  async expectBillingDashboardLayout() {
    await this.expectDashboardLoaded();
    await this.expectTotalMinutesEmpty();
    await expect(this.page.getByText(BILLING_COPY.noUsageInPeriod)).toBeVisible();
  }

  async expectSidebarLinkVisible() {
    await expect(this.page.getByRole("link", { name: /^Billing$/i })).toBeVisible();
  }

  /** @deprecated Use expectDashboardLoaded */
  async expectBillingContentVisible() {
    await this.expectDashboardLoaded();
  }
}
