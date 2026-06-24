import { test, expect } from "@playwright/test";
import { openBilling } from "../../../../helpers/billing.helper";
import {
  BILLING_TIME_RANGES,
  BILLING_USAGE_INTERVALS,
} from "../../../../data/billing-data";

test.describe("SETTINGS › Billing — Filters @journey @new-user @billing @positive", () => {
  test("TC-BL-010 @high @positive — Page loads at /billing", async ({ page }) => {
    await openBilling(page);
    await expect(page).toHaveURL(/\/billing/);
  });

  test("TC-BL-011 @high @positive — Time range dropdown visible with This month default", async ({
    page,
  }) => {
    const billing = await openBilling(page);
    await billing.expectTimeRangesVisible();
    await billing.expectTimeRangeDefault();
  });

  test("TC-BL-012 @medium @positive — Select Last 30 days keeps dashboard stable", async ({
    page,
  }) => {
    const billing = await openBilling(page);
    await billing.selectTimeRange("Last 30 days");
    await billing.expectPageHeader();
    await billing.expectDashboardLoaded();
  });

  test("TC-BL-013 @medium @positive — Select All time keeps dashboard stable", async ({
    page,
  }) => {
    const billing = await openBilling(page);
    await billing.selectTimeRange("All time");
    await billing.expectPageHeader();
    await billing.expectDashboardLoaded();
  });

  test("TC-BL-014 @medium @positive — All time range options selectable", async ({
    page,
  }) => {
    const billing = await openBilling(page);
    for (const range of BILLING_TIME_RANGES) {
      await billing.selectTimeRange(range);
      await billing.expectPageHeader();
    }
  });

  test("TC-BL-015 @high @positive — day interval tab selected by default", async ({
    page,
  }) => {
    const billing = await openBilling(page);
    await billing.expectUsageIntervalActive("day");
  });

  test("TC-BL-016 @medium @positive — Click week interval tab keeps page stable", async ({
    page,
  }) => {
    const billing = await openBilling(page);
    await billing.clickUsageInterval("week");
    await billing.expectPageHeader();
    await billing.expectUsageOverTimeSection();
  });

  test("TC-BL-017 @medium @positive — Click month interval tab keeps page stable", async ({
    page,
  }) => {
    const billing = await openBilling(page);
    await billing.clickUsageInterval("month");
    await billing.expectPageHeader();
    await billing.expectUsageOverTimeSection();
  });

  test("TC-BL-018 @medium @positive — All usage interval tabs visible", async ({
    page,
  }) => {
    const billing = await openBilling(page);
    for (const interval of BILLING_USAGE_INTERVALS) {
      await expect(billing.usageIntervalTab(interval)).toBeVisible();
    }
  });

  test("TC-BL-019 @medium @positive @manual — TOTAL MINUTES updates after call usage", async () => {
    test.skip(
      true,
      "Manual/telephony: complete calls, verify TOTAL MINUTES > 0",
    );
  });
});
