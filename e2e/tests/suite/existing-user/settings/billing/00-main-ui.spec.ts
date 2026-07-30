import { test, expect } from "@playwright/test";
import { openBilling } from "../../../../../helpers/billing.helper";
import { skipUnlessHasBillingUsage } from "../../../../../helpers/existing-user.helper";

test.describe("SETTINGS › Billing — Usage dashboard @journey @existing-user @billing @ui", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await skipUnlessHasBillingUsage(page, testInfo);
  });

  test("TC-BL-EU-001 @high @ui — Total minutes greater than zero", async ({
    page,
  }) => {
    const billing = await openBilling(page);
    await billing.expectHasUsageData();
  });

  test("TC-BL-EU-002 @high @ui — Dashboard layout with usage data", async ({
    page,
  }) => {
    const billing = await openBilling(page);
    await billing.expectDashboardLoaded();
    expect(await billing.parseTotalMinutes()).toBeGreaterThan(0);
  });

  test("TC-BL-EU-003 @medium @ui — Usage interval tabs visible", async ({
    page,
  }) => {
    const billing = await openBilling(page);
    await billing.expectUsageIntervalsVisible();
  });
});
