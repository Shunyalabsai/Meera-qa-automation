import { test, expect } from "@playwright/test";
import { openInsights } from "../../../../../helpers/insights.helper";
import { skipUnlessHasInsightsData } from "../../../../../helpers/existing-user.helper";
import { INSIGHTS_SAMPLES } from "../../../../../data/insights-data";

test.describe("ANALYZE › Insights — Negative with data @journey @existing-user @insights @negative", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await skipUnlessHasInsightsData(page, testInfo);
  });

  test("TC-IS-EU-N101 @medium @negative — Reversed date range handled", async ({
    page,
  }) => {
    const insights = await openInsights(page);
    const from = insights.dateFromInput();
    test.skip(
      !(await from.isVisible({ timeout: 5_000 }).catch(() => false)),
      "Date inputs not exposed",
    );

    await insights.fillDateFrom(INSIGHTS_SAMPLES.reversedFrom);
    await insights.fillDateTo(INSIGHTS_SAMPLES.reversedTo);
    await insights.dateToInput().press("Enter");
    await insights.expectPageHeader();
  });

  test("TC-IS-EU-N102 @medium @negative — Future date range zeroes KPIs", async ({
    page,
  }) => {
    const insights = await openInsights(page);
    const from = insights.dateFromInput();
    test.skip(
      !(await from.isVisible({ timeout: 5_000 }).catch(() => false)),
      "Date inputs not exposed",
    );

    await insights.fillDateFrom(INSIGHTS_SAMPLES.futureFrom);
    await insights.fillDateTo(INSIGHTS_SAMPLES.futureTo);
    await insights.dateToInput().press("Enter");
    expect(await insights.parseTotalCalls()).toBe(0);
  });

  test("TC-IS-EU-N103 @low @negative — Invalid insights sub-route handled", async ({
    page,
  }) => {
    await page.goto("/vap/insights/this-path-does-not-exist");
    await expect(
      page.getByText(/404|not found|Insights/i).first(),
    ).toBeVisible({ timeout: 15_000 });
  });
});
