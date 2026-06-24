import { test, expect } from "@playwright/test";
import { InsightsPage } from "../../../../pages/insights.page";
import { isInsightsEmptyState } from "../../../../helpers/insights.helper";
import { INSIGHTS_COPY } from "../../../../data/insights-data";

test.describe("ANALYZE › Insights — Main UI @journey @new-user @insights", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(
      !(await isInsightsEmptyState(page)),
      "Insights has call data — empty state not shown",
    );
  });

  test("TC-IS-001 @high @ui — Empty KPIs show zero values", async ({ page }) => {
    const insights = new InsightsPage(page);
    await insights.expectEmptyState();
  });

  test("TC-IS-002 @high @ui — All five KPI cards visible", async ({ page }) => {
    const insights = new InsightsPage(page);
    await insights.expectKpiCardsVisible();
    await insights.expectEmptyKpis();
  });

  test("TC-IS-003 @high @ui — Agent filter and date controls visible", async ({
    page,
  }) => {
    const insights = new InsightsPage(page);
    await insights.expectFiltersAndControlsVisible();
    await insights.expectAgentFilterDefault();
    await insights.expectDatePresetActive("Last 30 days");
  });

  test("TC-IS-004 @high @ui — All chart sections visible in empty state", async ({
    page,
  }) => {
    const insights = new InsightsPage(page);
    await insights.expectChartSectionsVisible();
  });

  test("TC-IS-005 @medium @ui — Hourly heatmap shows day labels", async ({
    page,
  }) => {
    const insights = new InsightsPage(page);
    await insights.expectHeatmapAxesVisible();
  });

  test("TC-IS-006 @medium @ui — Campaign Performance empty message", async ({
    page,
  }) => {
    const insights = new InsightsPage(page);
    await insights.expectCampaignTableVisible();
    await expect(page.getByText(INSIGHTS_COPY.emptyCampaign)).toBeVisible();
  });

  test("TC-IS-007 @medium @ui — Sidebar Insights nav link visible", async ({
    page,
  }) => {
    await expect(page.getByRole("link", { name: /^Insights$/i })).toBeVisible();
  });
});
