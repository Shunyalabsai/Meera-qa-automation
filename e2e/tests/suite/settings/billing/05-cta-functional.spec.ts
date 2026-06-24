import { test, expect } from "@playwright/test";
import { openBilling } from "../../../../helpers/billing.helper";
import { gotoApp } from "../../../../helpers/navigate";
import { BILLING_TIME_RANGES, BILLING_USAGE_INTERVALS } from "../../../../data/billing-data";

test.describe("SETTINGS › Billing — CTA functional @billing @cta", () => {
  test("CTA-BL-001 @high @cta — Billing sidebar link navigates to billing", async ({
    page,
  }) => {
    await gotoApp(page, "agents");
    await page.getByRole("link", { name: /^Billing$/i }).click();
    await expect(page).toHaveURL(/\/billing/, { timeout: 30_000 });
    await expect(page.getByRole("heading", { name: /^Billing$/i })).toBeVisible();
  });

  test("CTA-BL-002 @high @cta — Time range dropdown opens and selects Last 30 days", async ({
    page,
  }) => {
    const billing = await openBilling(page);
    await billing.selectTimeRange("Last 30 days");
    await expect(billing.timeRangeTrigger()).toContainText(/Last 30 days/i);
    await billing.expectDashboardLoaded();
  });

  test("CTA-BL-003 @high @cta — day week month interval tabs are clickable", async ({
    page,
  }) => {
    const billing = await openBilling(page);
    for (const interval of BILLING_USAGE_INTERVALS) {
      await billing.clickUsageInterval(interval);
      await billing.expectUsageOverTimeSection();
    }
  });

  test("CTA-BL-004 @medium @cta — All time range options clickable", async ({
    page,
  }) => {
    const billing = await openBilling(page);
    for (const range of BILLING_TIME_RANGES) {
      await billing.selectTimeRange(range);
      await billing.expectPageHeader();
    }
  });
});
