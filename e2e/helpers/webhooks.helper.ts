import { Page } from "@playwright/test";
import { WebhooksPage } from "../pages/webhooks.page";

export async function openWebhooks(page: Page): Promise<WebhooksPage> {
  const webhooks = new WebhooksPage(page);
  await webhooks.open();
  return webhooks;
}

export async function hasEnabledQuickApplyCheckboxes(
  page: Page,
): Promise<boolean> {
  const webhooks = new WebhooksPage(page);
  await webhooks.open();
  return webhooks.hasEnabledQuickApplyCheckboxes();
}

export async function hasAnySubscribeButton(page: Page): Promise<boolean> {
  const webhooks = new WebhooksPage(page);
  await webhooks.open();
  return webhooks.hasAnySubscribeButton();
}
