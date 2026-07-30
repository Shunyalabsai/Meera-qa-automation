import { test, expect } from "@playwright/test";
import { openBilling } from "../../../../../helpers/billing.helper";
import { skipUnlessHasBillingUsage } from "../../../../../helpers/existing-user.helper";

test.describe("SETTINGS › Billing — Negative with usage @journey @existing-user @billing @negative", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await skipUnlessHasBillingUsage(page, testInfo);
  });

  test("TC-BL-EU-N101 @medium @negative — Invalid billing sub-route handled", async ({
    page,
  }) => {
    await page.goto("/vap/billing/invalid-path");
    await expect(
      page.getByText(/404|not found|Billing/i).first(),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("TC-BL-EU-N102 @low @negative — Rapid time range switching stable", async ({
    page,
  }) => {
    const billing = await openBilling(page);
    await billing.selectTimeRange("Last 30 days");
    await billing.selectTimeRange("All time");
    await billing.selectTimeRange("This month");
    await billing.expectDashboardLoaded();
  });
});
