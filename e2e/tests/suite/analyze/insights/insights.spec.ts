import { test, expect } from "@playwright/test";
import { InsightsPage } from "../../../../pages/insights.page";

test.describe("ANALYZE › Insights @smoke @insights", () => {
  test("TC-AN-004 @high @positive — Insights dashboard loads", async ({ page }) => {
    const insights = new InsightsPage(page);
    await insights.open();
    await insights.expectFiltersAndControlsVisible();
    await insights.expectDashboardLayout();
  });
});
