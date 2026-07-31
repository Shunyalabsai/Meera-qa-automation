import { test, expect } from "@playwright/test";
import { openInsights } from "../../../../../helpers/insights.helper";
import { skipUnlessHasInsightsData } from "../../../../../helpers/existing-user.helper";

test.describe("ANALYZE › Insights — Widgets with data @journey @existing-user @insights @positive", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await skipUnlessHasInsightsData(page, testInfo);
  });

  test("TC-IS-EU-020 @high @positive — Calls Over Time section visible", async ({
    page,
  }) => {
    await expect(page.getByText(/Calls Over Time/i).first()).toBeVisible();
  });

  test("TC-IS-EU-021 @high @positive — Outcome Distribution visible", async ({
    page,
  }) => {
    await expect(page.getByText(/Outcome Distribution/i).first()).toBeVisible();
  });

  test("TC-IS-EU-022 @medium @positive — Campaign Performance table visible", async ({
    page,
  }) => {
    const insights = await openInsights(page);
    await insights.expectCampaignTableVisible();
  });

  test("TC-IS-EU-023 @medium @positive — Sentiment Trends legend visible", async ({
    page,
  }) => {
    await expect(page.getByText(/Sentiment Trends/i).first()).toBeVisible();
  });
});
