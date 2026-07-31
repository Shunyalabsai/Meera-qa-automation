import { test } from "@playwright/test";
import { BillingPage } from "../../../../pages/billing.page";

test.describe("SETTINGS › Billing @smoke @billing", () => {
  test("TC-BL-001 @high @positive — Billing page loads", async ({ page }) => {
    const billing = new BillingPage(page);
    await billing.open();
    await billing.expectTimeRangeDefault();
    await billing.expectDashboardLoaded();
  });
});
