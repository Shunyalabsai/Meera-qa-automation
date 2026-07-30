import { test, expect } from "@playwright/test";
import { openInsights } from "../../../../../helpers/insights.helper";
import { skipUnlessHasInsightsData } from "../../../../../helpers/existing-user.helper";

test.describe("ANALYZE › Insights — CTA with data @journey @existing-user @insights @cta", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await skipUnlessHasInsightsData(page, testInfo);
  });

  test("CTA-IS-EU-001 @high @cta — Last 7 days preset tab clickable", async ({
    page,
  }) => {
    const insights = await openInsights(page);
    await insights.clickDatePreset("Last 7 days");
    await insights.expectPageHeader();
  });

  test("CTA-IS-EU-002 @medium @cta — Agent filter combobox clickable", async ({
    page,
  }) => {
    const insights = await openInsights(page);
    const select = insights.agentFilterSelect();
    await expect(select).toBeEnabled();
    await select.click();
  });
});
