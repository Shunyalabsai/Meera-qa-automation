import { test, expect } from "@playwright/test";
import { BillingPage } from "../../../../pages/billing.page";
import { isBillingEmptyState } from "../../../../helpers/billing.helper";
import { STAGING_EMPTY_SKIP } from "../../../../helpers/staging-profile";
import { BILLING_COPY } from "../../../../data/billing-data";

test.describe("SETTINGS › Billing — Main UI @journey @new-user @billing @smoke", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(
      !(await isBillingEmptyState(page)),
      STAGING_EMPTY_SKIP.billing,
    );
  });

  test("TC-BL-002 @smoke @high @ui — Empty state shows 0.0 total minutes", async ({
    page,
  }) => {
    const billing = new BillingPage(page);
    await billing.expectEmptyState();
  });

  test("TC-BL-003 @high @ui — Header subtitle Usage and cost by provider", async ({
    page,
  }) => {
    const billing = new BillingPage(page);
    await billing.open();
    await expect(page.getByText(BILLING_COPY.subtitle).first()).toBeVisible();
  });

  test("TC-BL-004 @high @ui — Usage over time section with day week month tabs", async ({
    page,
  }) => {
    const billing = new BillingPage(page);
    await billing.open();
    await billing.expectUsageOverTimeSection();
  });

  test("TC-BL-005 @medium @ui — Time range dropdown defaults to This month", async ({
    page,
  }) => {
    const billing = new BillingPage(page);
    await billing.open();
    await billing.expectTimeRangeDefault();
  });

  test("TC-BL-006 @medium @ui — No usage recorded empty messages visible", async ({
    page,
  }) => {
    const billing = new BillingPage(page);
    await billing.open();
    await expect(page.getByText(BILLING_COPY.noUsageInWindow)).toBeVisible();
    await expect(page.getByText(BILLING_COPY.noUsageInPeriod)).toBeVisible();
  });

  test("TC-BL-007 @medium @ui — Sidebar Billing nav link visible", async ({
    page,
  }) => {
    const billing = new BillingPage(page);
    await billing.open();
    await billing.expectSidebarLinkVisible();
  });
});
