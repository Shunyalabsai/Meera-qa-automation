import { Page, type TestInfo } from "@playwright/test";
import { BillingPage } from "../pages/billing.page";
import { skipEnvPrecondition } from "./skip";
import { STAGING_EMPTY_SKIP } from "./staging-profile";

export async function openBilling(page: Page): Promise<BillingPage> {
  const billing = new BillingPage(page);
  await billing.open();
  return billing;
}

export async function isBillingEmptyState(page: Page): Promise<boolean> {
  const billing = new BillingPage(page);
  await billing.open();
  return billing.isEmptyState();
}

/** Skip when Billing shows usage (existing-user staging profile). */
export async function skipUnlessBillingEmpty(
  page: Page,
  testInfo: TestInfo,
): Promise<void> {
  if (!(await isBillingEmptyState(page))) {
    skipEnvPrecondition(testInfo, STAGING_EMPTY_SKIP.billing);
  }
}
