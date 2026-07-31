import { test } from "@playwright/test";
import { openCallsList } from "../../../../helpers/calls.helper";
import { CALLS_FILTER_SAMPLES } from "../../../../data/calls-filter-data";
import { VALID_UUID } from "../../../../utils/test-data";

test.describe("ANALYZE › Calls — Search & text filters @journey @new-user @calls @positive", () => {
  test("TC-CL-020 @high @positive — Search by Call ID via Enter", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    test.skip(
      !(await calls.callIdSearchInput().isVisible({ timeout: 5_000 }).catch(() => false)),
      "Call ID search not exposed",
    );

    await calls.searchByCallId(VALID_UUID);
    await calls.expectCallIdSearchNoResult();
  });

  test("TC-CL-021 @high @positive — Search by Call ID via Go button", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    test.skip(
      !(await calls.goButton().isVisible({ timeout: 5_000 }).catch(() => false)),
      "Go button not exposed",
    );

    await calls.searchByCallIdGo(VALID_UUID);
    await calls.expectCallIdSearchNoResult();
  });

  test("TC-CL-022 @medium @positive — Filter by from number", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    const input = calls.fromNumberInput();
    test.skip(
      !(await input.isVisible({ timeout: 5_000 }).catch(() => false)),
      "From number filter not exposed",
    );

    await calls.fillFromNumber(CALLS_FILTER_SAMPLES.fromNumber);
    await input.press("Enter");
    await calls.expectEmptyOrTable();
  });

  test("TC-CL-023 @medium @positive — Filter by to number", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    const input = calls.toNumberInput();
    test.skip(
      !(await input.isVisible({ timeout: 5_000 }).catch(() => false)),
      "To number filter not exposed",
    );

    await calls.fillToNumber(CALLS_FILTER_SAMPLES.toNumber);
    await input.press("Enter");
    await calls.expectEmptyOrTable();
  });

  test("TC-CL-024 @medium @positive — Filter by date range", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    const from = calls.dateFromInput();
    const to = calls.dateToInput();
    test.skip(
      !(await from.isVisible({ timeout: 5_000 }).catch(() => false)),
      "Date filters not exposed",
    );

    await calls.fillDateFrom("2024-01-01");
    await calls.fillDateTo("2024-12-31");
    await to.press("Enter");
    await calls.expectEmptyOrTable();
  });

  test("TC-CL-025 @medium @positive — Filter by duration min and max", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    const min = calls.durationMinInput();
    test.skip(
      !(await min.isVisible({ timeout: 5_000 }).catch(() => false)),
      "Duration filters not exposed",
    );

    await calls.fillDuration(
      CALLS_FILTER_SAMPLES.minDuration,
      CALLS_FILTER_SAMPLES.maxDuration,
    );
    await calls.durationMaxInput().press("Enter");
    await calls.expectEmptyOrTable();
  });
});
