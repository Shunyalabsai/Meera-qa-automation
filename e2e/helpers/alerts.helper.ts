import { Page } from "@playwright/test";
import { AlertsPage } from "../pages/alerts.page";

export async function openAlerts(page: Page): Promise<AlertsPage> {
  const alerts = new AlertsPage(page);
  await alerts.open();
  return alerts;
}

export async function isAlertsRulesEmpty(page: Page): Promise<boolean> {
  const alerts = new AlertsPage(page);
  await alerts.open();
  return alerts.isRulesEmptyState();
}

export async function openNewRuleForm(page: Page): Promise<AlertsPage> {
  const alerts = await openAlerts(page);
  await alerts.clickNewRule();
  return alerts;
}

export async function openAddChannelForm(page: Page): Promise<AlertsPage> {
  const alerts = await openAlerts(page);
  await alerts.channelsTab().click();
  await alerts.clickAddChannel();
  return alerts;
}
