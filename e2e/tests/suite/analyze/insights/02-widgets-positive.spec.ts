import { test, expect } from "@playwright/test";
import { openInsights, skipUnlessInsightsEmpty } from "../../../../helpers/insights.helper";

test.describe("ANALYZE › Insights — Dashboard widgets @journey @new-user @insights @positive", () => {
  test("TC-IS-020 @high @positive — KPI cards show expected empty values", async ({
    page,
  }, testInfo) => {
    await skipUnlessInsightsEmpty(page, testInfo);
    const insights = await openInsights(page);
    await insights.expectKpiCardsVisible();
    await insights.expectEmptyKpis();
  });

  test("TC-IS-021 @high @positive — Calls Over Time section visible", async ({
    page,
  }) => {
    await openInsights(page);
    await expect(page.getByText(/Calls Over Time/i).first()).toBeVisible();
  });

  test("TC-IS-022 @high @positive — Outcome Distribution section visible", async ({
    page,
  }) => {
    await openInsights(page);
    await expect(page.getByText(/Outcome Distribution/i).first()).toBeVisible();
  });

  test("TC-IS-023 @medium @positive — Agent Performance legend visible", async ({
    page,
  }) => {
    await openInsights(page);
    await expect(page.getByText(/Agent Performance/i).first()).toBeVisible();
    await expect(page.getByText(/Completed/i).first()).toBeVisible();
    await expect(page.getByText(/Total/i).first()).toBeVisible();
  });

  test("TC-IS-024 @medium @positive — Sentiment Trends legend visible", async ({
    page,
  }) => {
    await openInsights(page);
    await expect(page.getByText(/Sentiment Trends/i).first()).toBeVisible();
    await expect(page.getByText(/positive/i).first()).toBeVisible();
    await expect(page.getByText(/negative/i).first()).toBeVisible();
  });

  test("TC-IS-025 @medium @positive — Call Distribution and duration metrics visible", async ({
    page,
  }) => {
    await openInsights(page);
    await expect(
      page.getByText(/Call Distribution|Latency Trends/i).first(),
    ).toBeVisible();
    await expect(
      page.getByText(/seconds|p50|Less than/i).first(),
    ).toBeVisible();
  });

  test("TC-IS-026 @medium @positive — Campaign Performance table headers visible", async ({
    page,
  }) => {
    const insights = await openInsights(page);
    await insights.expectCampaignTableVisible();
  });

});
