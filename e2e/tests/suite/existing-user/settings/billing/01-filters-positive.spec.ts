import { test, expect } from "@playwright/test";
import { openBilling } from "../../../../../helpers/billing.helper";
import { skipUnlessHasBillingUsage } from "../../../../../helpers/existing-user.helper";
import { BILLING_TIME_RANGES } from "../../../../../data/billing-data";

test.describe("SETTINGS › Billing — Filters with usage @journey @existing-user @billing @positive", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await skipUnlessHasBillingUsage(page, testInfo);
  });

  test("TC-BL-EU-010 @high @positive — This month shows usage", async ({
    page,
  }) => {
    const billing = await openBilling(page);
    await billing.selectTimeRange("This month");
    expect(await billing.parseTotalMinutes()).toBeGreaterThan(0);
  });

  test("TC-BL-EU-011 @medium @positive — Last 30 days keeps dashboard stable", async ({
    page,
  }) => {
    const billing = await openBilling(page);
    await billing.selectTimeRange("Last 30 days");
    await billing.expectDashboardLoaded();
  });

  test("TC-BL-EU-012 @medium @positive — All time range selectable", async ({
    page,
  }) => {
    const billing = await openBilling(page);
    for (const range of BILLING_TIME_RANGES) {
      await billing.selectTimeRange(range);
      await billing.expectPageHeader();
    }
  });

  test("TC-BL-EU-013 @medium @positive — Week interval tab clickable", async ({
    page,
  }) => {
    const billing = await openBilling(page);
    await billing.clickUsageInterval("week");
    await billing.expectUsageOverTimeSection();
    expect(await billing.parseTotalMinutes()).toBeGreaterThanOrEqual(0);
  });
});
