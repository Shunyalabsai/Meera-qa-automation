import { Page } from "@playwright/test";
import { BillingPage } from "../pages/billing.page";

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
