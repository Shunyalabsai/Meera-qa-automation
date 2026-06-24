import { test, expect } from "@playwright/test";
import { openCallsList } from "../../../../helpers/calls.helper";
import { reloadSpaRoute } from "../../../../helpers/navigate";
import { CALLS_FILTER_SAMPLES } from "../../../../data/calls-filter-data";

test.describe("ANALYZE › Calls — Edge @journey @new-user @calls @edge", () => {
  test("TC-CL-E101 @medium @edge — Combined filters still show empty or table", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    await calls.selectFilterOption("State", "completed");
    await calls.selectFilterOption("Outcome", "resolved");
    await calls.selectFilterOption("Sentiment", "positive");
    await calls.selectFilterOption("Language", "en");

    const from = calls.fromNumberInput();
    if (await from.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await calls.fillFromNumber(CALLS_FILTER_SAMPLES.fromNumber);
    }

    await calls.expectEmptyOrTable();
  });

  test("TC-CL-E102 @medium @edge — Navigate away and back preserves Calls page", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    await page.getByRole("link", { name: /^Agents$/i }).click();
    await expect(page).toHaveURL(/\/agents/, { timeout: 30_000 });
    await page.getByRole("link", { name: /^Calls$/i }).click();
    await calls.expectPageHeader();
    await calls.expectEmptyOrTable();
  });

  test("TC-CL-E103 @medium @edge — ANALYZE section siblings reachable from Calls", async ({
    page,
  }) => {
    await openCallsList(page);
    await page.getByRole("link", { name: /^Recordings$/i }).click();
    await expect(page).toHaveURL(/\/recordings/, { timeout: 30_000 });
    await page.getByRole("link", { name: /^Insights$/i }).click();
    await expect(page).toHaveURL(/\/insights/, { timeout: 30_000 });
  });

  test("TC-CL-E104 @low @edge — Page reload keeps Calls heading and filters", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    await calls.expectAllFiltersVisible();
    await reloadSpaRoute(page, "calls");
    await calls.expectPageHeader();
    await calls.expectAllFiltersVisible();
  });

  test("TC-CL-E105 @medium @edge — Future date range returns no calls", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    const from = calls.dateFromInput();
    test.skip(
      !(await from.isVisible({ timeout: 5_000 }).catch(() => false)),
      "Date filters not exposed",
    );

    await calls.fillDateFrom(CALLS_FILTER_SAMPLES.futureDateFrom);
    await calls.fillDateTo(CALLS_FILTER_SAMPLES.futureDateTo);
    await calls.dateToInput().press("Enter");
    await calls.expectEmptyState();
  });

  test("TC-CL-E106 @medium @edge — Reset State to Any after filtering", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    await calls.selectFilterOption("State", "failed");
    await calls.selectFilterOption("State", "Any");
    await expect(page.getByRole("heading", { name: /^Calls$/i })).toBeVisible();
    await calls.expectEmptyOrTable();
  });

  test("TC-CL-E107 @medium @edge @manual — Completed call appears in list after Playground call", async () => {
    test.skip(
      true,
      "Manual/telephony: complete call in Playground, verify row on Calls list",
    );
  });
});
