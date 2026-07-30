import { test, expect } from "@playwright/test";
import { openCallsList } from "../../../../../helpers/calls.helper";
import { skipUnlessHasCallRecords } from "../../../../../helpers/existing-user.helper";
import { CALLS_FILTER_SAMPLES } from "../../../../../data/calls-filter-data";

test.describe("ANALYZE › Calls — Negative with data @journey @existing-user @calls @negative", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await skipUnlessHasCallRecords(page, testInfo);
  });

  test("TC-CL-EU-N101 @medium @negative — Malformed Call ID blocked", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    await calls.callIdSearchInput().fill(CALLS_FILTER_SAMPLES.invalidCallId);
    await calls.expectInvalidCallIdSearchBlocked();
  });

  test("TC-CL-EU-N102 @medium @negative — Min duration greater than max handled", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    const min = calls.durationMinInput();
    test.skip(
      !(await min.isVisible({ timeout: 5_000 }).catch(() => false)),
      "Duration filters not exposed",
    );

    await calls.fillDuration("99999", "1");
    await calls.durationMaxInput().press("Enter");
    await calls.expectPageHeader();
    await expect(await calls.parseShownCount()).toBe(0);
  });

  test("TC-CL-EU-N103 @medium @negative — Future date range shows empty state", async ({
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

  test("TC-CL-EU-N104 @low @negative — Invalid calls sub-route handled", async ({
    page,
  }) => {
    await page.goto("/vap/calls/this-id-does-not-exist");
    await expect(
      page.getByText(/404|not found|Calls|No calls found/i).first(),
    ).toBeVisible({ timeout: 15_000 });
  });
});
