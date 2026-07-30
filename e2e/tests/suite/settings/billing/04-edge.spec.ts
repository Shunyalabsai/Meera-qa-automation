import { test, expect } from "@playwright/test";
import { openBilling, isBillingEmptyState } from "../../../../helpers/billing.helper";
import { reloadSpaRoute } from "../../../../helpers/navigate";
import { BILLING_COPY } from "../../../../data/billing-data";

test.describe("SETTINGS › Billing — Edge @journey @new-user @billing @edge", () => {
  test("TC-BL-E101 @medium @edge — Time range plus interval tab keeps dashboard stable", async ({
    page,
  }) => {
    const billing = await openBilling(page);
    await billing.selectTimeRange("Last 30 days");
    await billing.clickUsageInterval("week");
    await billing.expectDashboardLoaded();
  });

  test("TC-BL-E102 @medium @edge — Navigate away and back preserves Billing page", async ({
    page,
  }) => {
    const billing = await openBilling(page);
    await page.getByRole("link", { name: /^Alerts$/i }).click();
    await expect(page).toHaveURL(/\/alerts/, { timeout: 30_000 });
    await page.getByRole("link", { name: /^Billing$/i }).click();
    await billing.expectPageHeader();
    await billing.expectTimeRangeDefault();
  });

  test("TC-BL-E103 @medium @edge — SETTINGS siblings reachable from Billing", async ({
    page,
  }) => {
    await openBilling(page);
    await page.getByRole("link", { name: /^Alerts$/i }).click();
    await expect(page).toHaveURL(/\/alerts/, { timeout: 30_000 });
    await page.getByRole("link", { name: /^Webhooks$/i }).click();
    await expect(page).toHaveURL(/\/webhooks/, { timeout: 30_000 });
  });

  test("TC-BL-E104 @low @edge — Page reload keeps heading and filters", async ({
    page,
  }) => {
    const billing = await openBilling(page);
    await billing.expectUsageOverTimeSection();
    await reloadSpaRoute(page, "billing");
    await billing.expectPageHeader();
    await billing.expectTimeRangeDefault();
    await billing.expectUsageIntervalsVisible();
  });

  test("TC-BL-E105 @medium @edge — Switch time range then reset to This month", async ({
    page,
  }) => {
    const billing = await openBilling(page);
    await billing.selectTimeRange("All time");
    await billing.selectTimeRange("This month");
    await billing.expectTimeRangeDefault();
    if (await isBillingEmptyState(page)) {
      await expect(page.getByText(BILLING_COPY.noUsageInPeriod)).toBeVisible();
    }
  });

});
