import { test, expect } from "@playwright/test";
import { openInsights } from "../../../../helpers/insights.helper";
import {
  INSIGHTS_DATE_PRESETS,
  INSIGHTS_DEFAULT_DATE_PRESET,
} from "../../../../data/insights-data";

test.describe("ANALYZE › Insights — Filters @journey @new-user @insights @positive", () => {
  test("TC-AN-004 @high @positive — Insights dashboard loads", async ({ page }) => {
    const insights = await openInsights(page);
    await insights.expectPageHeader();
  });

  test("TC-IS-010 @high @positive — Page loads at /insights", async ({ page }) => {
    await openInsights(page);
    await expect(page).toHaveURL(/\/insights/);
  });

  test("TC-IS-011 @medium @positive — Agent filter defaults to All agents", async ({
    page,
  }) => {
    const insights = await openInsights(page);
    await insights.expectAgentFilterDefault();
  });

  test("TC-IS-012 @medium @positive — Last 30 days tab visible and active by default", async ({
    page,
  }) => {
    const insights = await openInsights(page);
    await expect(insights.datePresetTab("Last 30 days")).toBeVisible();
    await insights.expectDatePresetActive(INSIGHTS_DEFAULT_DATE_PRESET);
  });

  test("TC-IS-013 @medium @positive — Click Last 7 days tab keeps dashboard stable", async ({
    page,
  }) => {
    const insights = await openInsights(page);
    await insights.clickDatePreset("Last 7 days");
    await insights.expectPageHeader();
    await insights.expectDashboardLayout();
  });

  test("TC-IS-014 @medium @positive — Click Last 90 days keeps dashboard stable", async ({
    page,
  }) => {
    const insights = await openInsights(page);
    await insights.clickDatePreset("Last 90 days");
    await insights.expectPageHeader();
    await insights.expectDashboardLayout();
  });

  test("TC-IS-015 @medium @positive — Click All time keeps dashboard stable", async ({
    page,
  }) => {
    const insights = await openInsights(page);
    await insights.clickDatePreset("All time");
    await insights.expectPageHeader();
    await insights.expectDashboardLayout();
  });

  test("TC-IS-016 @medium @positive — All date preset tabs visible", async ({
    page,
  }) => {
    const insights = await openInsights(page);
    for (const preset of INSIGHTS_DATE_PRESETS) {
      await expect(insights.datePresetTab(preset)).toBeVisible();
    }
  });

});
