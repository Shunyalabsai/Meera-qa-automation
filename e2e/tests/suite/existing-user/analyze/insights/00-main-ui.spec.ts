import { test, expect } from "@playwright/test";
import { openInsights } from "../../../../../helpers/insights.helper";
import { skipUnlessHasInsightsData } from "../../../../../helpers/existing-user.helper";

test.describe("ANALYZE › Insights — Populated dashboard @journey @existing-user @insights @ui", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await skipUnlessHasInsightsData(page, testInfo);
  });

  test("TC-IS-EU-001 @high @ui — KPI cards show call data", async ({ page }) => {
    const insights = await openInsights(page);
    await insights.expectPopulatedKpis();
  });

  test("TC-IS-EU-002 @high @ui — Total calls count is greater than zero", async ({
    page,
  }) => {
    const insights = await openInsights(page);
    expect(await insights.parseTotalCalls()).toBeGreaterThan(0);
  });

  test("TC-IS-EU-003 @high @ui — Chart sections visible with data", async ({
    page,
  }) => {
    const insights = await openInsights(page);
    await insights.expectChartSectionsVisible();
    await insights.expectDashboardLayout();
  });

  test("TC-IS-EU-004 @medium @ui — Agent filter and date controls visible", async ({
    page,
  }) => {
    const insights = await openInsights(page);
    await insights.expectFiltersAndControlsVisible();
  });
});
