import { test } from "@playwright/test";
import { InsightsPage } from "../../../../pages/insights.page";

test.describe("ANALYZE › Insights @insights", () => {
  test("TC-AN-004 @smoke @high @positive — Insights dashboard loads", async ({ page }) => {
    const insights = new InsightsPage(page);
    await insights.open();
    await insights.expectFiltersAndControlsVisible();
    await insights.expectDashboardLayout();
  });
});
