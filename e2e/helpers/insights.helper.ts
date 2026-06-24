import { Page } from "@playwright/test";
import { InsightsPage } from "../pages/insights.page";

export async function openInsights(page: Page): Promise<InsightsPage> {
  const insights = new InsightsPage(page);
  await insights.open();
  return insights;
}

export async function isInsightsEmptyState(page: Page): Promise<boolean> {
  const insights = new InsightsPage(page);
  await insights.open();
  return insights.isEmptyState();
}
