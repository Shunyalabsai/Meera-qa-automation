import { test, expect } from "@playwright/test";
import { openBilling, isBillingEmptyState } from "../../../../helpers/billing.helper";
import { BILLING_COPY } from "../../../../data/billing-data";

test.describe("SETTINGS › Billing — Negative @journey @new-user @billing @negative", () => {
  test("TC-BL-N101 @low @negative — Invalid billing sub-route handled gracefully", async ({
    page,
  }) => {
    await page.goto("/vap/billing/invalid-path");
    await expect(
      page.getByText(/404|not found|Billing/i).first(),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("TC-BL-N102 @medium @negative — Last 30 days with no usage keeps empty state", async ({
    page,
  }) => {
    test.skip(!(await isBillingEmptyState(page)), "Usage data exists — empty state not shown");
    const billing = await openBilling(page);
    await billing.selectTimeRange("Last 30 days");
    await billing.expectTotalMinutesEmpty();
    await expect(page.getByText(BILLING_COPY.noUsageInPeriod)).toBeVisible();
  });

  test("TC-BL-N103 @medium @negative — All time with no usage keeps empty state", async ({
    page,
  }) => {
    test.skip(!(await isBillingEmptyState(page)), "Usage data exists — empty state not shown");
    const billing = await openBilling(page);
    await billing.selectTimeRange("All time");
    await billing.expectTotalMinutesEmpty();
    await expect(page.getByText(BILLING_COPY.noUsageInWindow)).toBeVisible();
  });

  test("TC-BL-N104 @low @negative — Rapid interval switching does not break page", async ({
    page,
  }) => {
    const billing = await openBilling(page);
    await billing.clickUsageInterval("week");
    await billing.clickUsageInterval("month");
    await billing.clickUsageInterval("day");
    await billing.expectPageHeader();
    await billing.expectDashboardLoaded();
  });
});
