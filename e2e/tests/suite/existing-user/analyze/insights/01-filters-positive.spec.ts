import { test, expect } from "@playwright/test";
import { openInsights } from "../../../../../helpers/insights.helper";
import { skipUnlessHasInsightsData } from "../../../../../helpers/existing-user.helper";

test.describe("ANALYZE › Insights — Filters with data @journey @existing-user @insights @positive", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await skipUnlessHasInsightsData(page, testInfo);
  });

  test("TC-IS-EU-010 @high @positive — Last 7 days preset keeps dashboard stable", async ({
    page,
  }) => {
    const insights = await openInsights(page);
    const before = await insights.parseTotalCalls();
    await insights.clickDatePreset("Last 7 days");
    expect(await insights.parseTotalCalls()).toBeGreaterThanOrEqual(0);
    expect(await insights.parseTotalCalls()).toBeLessThanOrEqual(before);
  });

  test("TC-IS-EU-011 @medium @positive — Last 90 days preset loads", async ({
    page,
  }) => {
    const insights = await openInsights(page);
    await insights.clickDatePreset("Last 90 days");
    await insights.expectPageHeader();
    await insights.expectDashboardLayout();
  });

  test("TC-IS-EU-012 @medium @positive — All time preset loads", async ({
    page,
  }) => {
    const insights = await openInsights(page);
    await insights.clickDatePreset("All time");
    expect(await insights.parseTotalCalls()).toBeGreaterThan(0);
  });

  test("TC-IS-EU-013 @medium @positive — Agent filter defaults to All agents", async ({
    page,
  }) => {
    const insights = await openInsights(page);
    await insights.expectAgentFilterDefault();
    expect(await insights.parseTotalCalls()).toBeGreaterThan(0);
  });
});
