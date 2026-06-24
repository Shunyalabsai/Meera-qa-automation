import { test, expect } from "@playwright/test";
import { openInsights } from "../../../../helpers/insights.helper";

test.describe("ANALYZE › Insights — Dashboard widgets @journey @new-user @insights @positive", () => {
  test("TC-IS-020 @high @positive — KPI cards show expected empty values", async ({
    page,
  }) => {
    const insights = await openInsights(page);
    await insights.expectKpiCardsVisible();
    await insights.expectEmptyKpis();
  });

  test("TC-IS-021 @high @positive — Calls Over Time section visible", async ({
    page,
  }) => {
    const insights = await openInsights(page);
    await expect(page.getByText(/Calls Over Time/i).first()).toBeVisible();
  });

  test("TC-IS-022 @high @positive — Outcome Distribution section visible", async ({
    page,
  }) => {
    const insights = await openInsights(page);
    await expect(page.getByText(/Outcome Distribution/i).first()).toBeVisible();
  });

  test("TC-IS-023 @medium @positive — Agent Performance legend visible", async ({
    page,
  }) => {
    const insights = await openInsights(page);
    await expect(page.getByText(/Agent Performance/i).first()).toBeVisible();
    await expect(page.getByText(/Completed/i).first()).toBeVisible();
    await expect(page.getByText(/Total/i).first()).toBeVisible();
  });

  test("TC-IS-024 @medium @positive — Sentiment Trends legend visible", async ({
    page,
  }) => {
    const insights = await openInsights(page);
    await expect(page.getByText(/Sentiment Trends/i).first()).toBeVisible();
    await expect(page.getByText(/positive/i).first()).toBeVisible();
    await expect(page.getByText(/negative/i).first()).toBeVisible();
  });

  test("TC-IS-025 @medium @positive — Latency Trends legend visible", async ({
    page,
  }) => {
    const insights = await openInsights(page);
    await expect(page.getByText(/Latency Trends/i).first()).toBeVisible();
    await expect(page.getByText(/p50/i).first()).toBeVisible();
    await expect(page.getByText(/p95/i).first()).toBeVisible();
    await expect(page.getByText(/p99/i).first()).toBeVisible();
  });

  test("TC-IS-026 @medium @positive — Campaign Performance table headers visible", async ({
    page,
  }) => {
    const insights = await openInsights(page);
    await insights.expectCampaignTableVisible();
  });

  test("TC-IS-027 @medium @positive @manual — KPIs update after completed calls", async () => {
    test.skip(
      true,
      "Manual/telephony: complete calls and verify TOTAL CALLS > 0",
    );
  });
});
