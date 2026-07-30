import { test, expect } from "@playwright/test";
import { openBilling } from "../../../../../helpers/billing.helper";
import { skipUnlessHasBillingUsage } from "../../../../../helpers/existing-user.helper";

test.describe("SETTINGS › Billing — CTA with usage @journey @existing-user @billing @cta", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await skipUnlessHasBillingUsage(page, testInfo);
  });

  test("CTA-BL-EU-001 @high @cta — Billing sidebar link from dashboard", async ({
    page,
  }) => {
    const billing = await openBilling(page);
    await billing.expectSidebarLinkVisible();
  });

  test("CTA-BL-EU-002 @medium @cta — Time range dropdown changes selection", async ({
    page,
  }) => {
    const billing = await openBilling(page);
    await billing.selectTimeRange("Last 30 days");
    await billing.expectPageHeader();
  });

  test("CTA-BL-EU-003 @medium @cta — Week interval tab clickable", async ({
    page,
  }) => {
    const billing = await openBilling(page);
    await billing.clickUsageInterval("week");
    await billing.expectUsageOverTimeSection();
  });
});
