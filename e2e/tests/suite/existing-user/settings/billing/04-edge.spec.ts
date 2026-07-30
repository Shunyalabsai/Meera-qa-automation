import { test, expect } from "@playwright/test";
import { openBilling } from "../../../../../helpers/billing.helper";
import { skipUnlessHasBillingUsage } from "../../../../../helpers/existing-user.helper";
import { reloadSpaRoute } from "../../../../../helpers/navigate";

test.describe("SETTINGS › Billing — Edge with usage @journey @existing-user @billing @edge", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await skipUnlessHasBillingUsage(page, testInfo);
  });

  test("TC-BL-EU-E101 @medium @edge — All interval tabs cycle without crash", async ({
    page,
  }) => {
    const billing = await openBilling(page);
    for (const interval of ["day", "week", "month"] as const) {
      await billing.clickUsageInterval(interval);
      await billing.expectPageHeader();
    }
  });

  test("TC-BL-EU-E102 @medium @edge — Navigate to Webhooks and back", async ({
    page,
  }) => {
    const billing = await openBilling(page);
    const minutes = await billing.readTotalMinutes();
    await page.getByRole("link", { name: /^Webhooks$/i }).click();
    await expect(page).toHaveURL(/webhooks/, { timeout: 30_000 });
    await page.getByRole("link", { name: /^Billing$/i }).click();
    await expect
      .poll(async () => billing.readTotalMinutes(), { timeout: 20_000 })
      .toBe(minutes);
  });

  test("TC-BL-EU-E103 @low @edge — Reload preserves usage minutes", async ({
    page,
  }) => {
    const billing = await openBilling(page);
    const minutes = await billing.readTotalMinutes();
    await reloadSpaRoute(page, "billing");
    await billing.expectPageHeader();
    await expect
      .poll(async () => billing.readTotalMinutes(), { timeout: 20_000 })
      .toBe(minutes);
  });
});
