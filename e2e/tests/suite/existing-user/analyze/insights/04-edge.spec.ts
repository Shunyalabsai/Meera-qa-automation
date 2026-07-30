import { test, expect } from "@playwright/test";
import { openInsights } from "../../../../../helpers/insights.helper";
import { skipUnlessHasInsightsData } from "../../../../../helpers/existing-user.helper";
import { reloadSpaRoute } from "../../../../../helpers/navigate";

test.describe("ANALYZE › Insights — Edge with data @journey @existing-user @insights @edge", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await skipUnlessHasInsightsData(page, testInfo);
  });

  test("TC-IS-EU-E101 @medium @edge — Rapid date preset switching stable", async ({
    page,
  }) => {
    const insights = await openInsights(page);
    await insights.clickDatePreset("Last 7 days");
    await insights.clickDatePreset("Last 90 days");
    await insights.clickDatePreset("All time");
    await insights.clickDatePreset("Last 30 days");
    expect(await insights.parseTotalCalls()).toBeGreaterThan(0);
  });

  test("TC-IS-EU-E102 @medium @edge — Navigate to Calls and back", async ({
    page,
  }) => {
    const insights = await openInsights(page);
    const total = await insights.parseTotalCalls();
    await page.getByRole("link", { name: /^Calls$/i }).click();
    await expect(page).toHaveURL(/\/calls/, { timeout: 30_000 });
    await page.getByRole("link", { name: /^Insights$/i }).click();
    expect(await insights.parseTotalCalls()).toBe(total);
  });

  test("TC-IS-EU-E103 @low @edge — Reload preserves populated KPIs", async ({
    page,
  }) => {
    const insights = await openInsights(page);
    const total = await insights.parseTotalCalls();
    await reloadSpaRoute(page, "insights");
    await insights.expectPageHeader();
    await expect
      .poll(async () => insights.parseTotalCalls(), { timeout: 20_000 })
      .toBe(total);
  });
});
