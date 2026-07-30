import { Page, type TestInfo } from "@playwright/test";
import { InsightsPage } from "../pages/insights.page";
import { skipEnvPrecondition } from "./skip";
import { STAGING_EMPTY_SKIP } from "./staging-profile";

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

/** Skip when Insights KPIs reflect real call history (existing-user staging profile). */
export async function skipUnlessInsightsEmpty(
  page: Page,
  testInfo: TestInfo,
): Promise<void> {
  if (!(await isInsightsEmptyState(page))) {
    skipEnvPrecondition(testInfo, STAGING_EMPTY_SKIP.insights);
  }
}
