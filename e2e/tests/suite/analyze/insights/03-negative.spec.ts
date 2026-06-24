import { test, expect } from "@playwright/test";
import { openInsights } from "../../../../helpers/insights.helper";
import { skipKnownIssue } from "../../../../helpers/skip";
import { INSIGHTS_COPY, INSIGHTS_SAMPLES } from "../../../../data/insights-data";

test.describe("ANALYZE › Insights — Negative @journey @new-user @insights @negative", () => {
  test("TC-IS-N101 @medium @negative — Date from after date to handled gracefully", async ({
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
    await insights.expectDashboardLayout();
  });

  test("TC-IS-N102 @medium @negative @untestable-ui — Invalid date format does not crash page", async (
    {},
    testInfo,
  ) => {
    skipKnownIssue(testInfo, "IS-N102");
  });

  test("TC-IS-N103 @low @negative — Invalid insights sub-route handled gracefully", async ({
    page,
  }) => {
    await page.goto("/vap/insights/this-path-does-not-exist");
    await expect(
      page
        .getByText(/404|not found|Insights|No campaign data/i)
        .first(),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("TC-IS-N104 @medium @negative — Future date range keeps empty KPIs", async ({
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
    await insights.expectEmptyKpis();
    await expect(page.getByText(INSIGHTS_COPY.emptyCampaign)).toBeVisible();
  });

  test("TC-IS-N105 @low @negative — Rapid tab switching does not break page", async ({
    page,
  }) => {
    const insights = await openInsights(page);
    await insights.clickDatePreset("Last 7 days");
    await insights.clickDatePreset("Last 90 days");
    await insights.clickDatePreset("All time");
    await insights.clickDatePreset("Last 30 days");
    await insights.expectPageHeader();
    await insights.expectDashboardLayout();
  });
});
