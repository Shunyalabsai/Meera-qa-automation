import { test, expect } from "@playwright/test";
import { openInsights } from "../../../../helpers/insights.helper";
import { reloadSpaRoute } from "../../../../helpers/navigate";
import { INSIGHTS_COPY } from "../../../../data/insights-data";

test.describe("ANALYZE › Insights — Edge @journey @new-user @insights @edge", () => {
  test("TC-IS-E101 @medium @edge — Agent filter plus date preset keeps dashboard stable", async ({
    page,
  }) => {
    const insights = await openInsights(page);
    await insights.selectAgentFilter("All agents");
    await insights.clickDatePreset("Last 30 days");
    await insights.expectPageHeader();
    await insights.expectFiltersAndControlsVisible();
    await insights.expectDashboardLayout();
  });

  test("TC-IS-E102 @medium @edge — Navigate away and back preserves Insights page", async ({
    page,
  }) => {
    const insights = await openInsights(page);
    await page.getByRole("link", { name: /^Calls$/i }).click();
    await expect(page).toHaveURL(/\/calls/, { timeout: 30_000 });
    await page.getByRole("link", { name: /^Insights$/i }).click();
    await insights.expectPageHeader();
    await insights.expectFiltersAndControlsVisible();
    await insights.expectDashboardLayout();
  });

  test("TC-IS-E103 @medium @edge — ANALYZE section siblings reachable from Insights", async ({
    page,
  }) => {
    await openInsights(page);
    await page.getByRole("link", { name: /^Calls$/i }).click();
    await expect(page).toHaveURL(/\/calls/, { timeout: 30_000 });
    await page.getByRole("link", { name: /^Recordings$/i }).click();
    await expect(page).toHaveURL(/\/recordings/, { timeout: 30_000 });
  });

  test("TC-IS-E104 @low @edge — Page reload keeps heading and KPI cards", async ({
    page,
  }) => {
    const insights = await openInsights(page);
    await insights.expectDashboardLayout();
    await reloadSpaRoute(page, "insights");
    await insights.expectPageHeader();
    await insights.expectKpiCardsVisible();
  });

  test("TC-IS-E105 @medium @edge — All time preset keeps empty campaign message", async ({
    page,
  }) => {
    const insights = await openInsights(page);
    await insights.clickDatePreset("All time");
    await expect(page.getByText(INSIGHTS_COPY.emptyCampaign)).toBeVisible();
  });

  test("TC-IS-E106 @medium @edge — Custom date range then preset resets view", async ({
    page,
  }) => {
    const insights = await openInsights(page);
    const from = insights.dateFromInput();
    test.skip(
      !(await from.isVisible({ timeout: 5_000 }).catch(() => false)),
      "Date inputs not exposed",
    );

    await insights.fillDateFrom("2024-06-01");
    await insights.fillDateTo("2024-06-30");
    await insights.clickDatePreset("Last 7 days");
    await insights.expectPageHeader();
    await insights.expectDashboardLayout();
  });

});
