import { test, expect } from "@playwright/test";
import { openCallsList } from "../../../../helpers/calls.helper";
import { CALLS_COPY, CALLS_FILTER_SAMPLES } from "../../../../data/calls-filter-data";
import { INVALID_UUID } from "../../../../utils/test-data";

test.describe("ANALYZE › Calls — Negative @journey @new-user @calls @negative", () => {
  test("TC-AN-N101 @medium @negative — Invalid call ID search shows no results", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    test.skip(
      !(await calls.callIdSearchInput().isVisible({ timeout: 5_000 }).catch(() => false)),
      "Call ID search not exposed",
    );

    await calls.searchByCallId(INVALID_UUID);
    await calls.expectCallIdSearchNoResult();
  });

  test("TC-CL-N102 @medium @negative — Malformed Call ID shows no results", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    test.skip(
      !(await calls.callIdSearchInput().isVisible({ timeout: 5_000 }).catch(() => false)),
      "Call ID search not exposed",
    );

    await calls.callIdSearchInput().fill(CALLS_FILTER_SAMPLES.invalidCallId);
    await calls.expectInvalidCallIdSearchBlocked();
  });

  test("TC-CL-N103 @medium @negative — Min duration greater than max still shows empty or table", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    const min = calls.durationMinInput();
    test.skip(
      !(await min.isVisible({ timeout: 5_000 }).catch(() => false)),
      "Duration filters not exposed",
    );

    await calls.fillDuration("500", "10");
    await calls.durationMaxInput().press("Enter");
    await calls.expectEmptyOrTable();
  });

  test("TC-CL-N104 @medium @negative — Date from after date to handled gracefully", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    const from = calls.dateFromInput();
    test.skip(
      !(await from.isVisible({ timeout: 5_000 }).catch(() => false)),
      "Date filters not exposed",
    );

    await calls.fillDateFrom("2025-12-31");
    await calls.fillDateTo("2025-01-01");
    await calls.dateToInput().press("Enter");
    await calls.expectEmptyOrTable();
  });

  test("TC-CL-N105 @low @negative — Empty Call ID Go does not break page", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    test.skip(
      !(await calls.goButton().isVisible({ timeout: 5_000 }).catch(() => false)),
      "Go button not exposed",
    );

    await calls.callIdSearchInput().fill("");
    await calls.expectGoButtonDisabled();
    await expect(page.getByRole("heading", { name: /^Calls$/i })).toBeVisible();
    await calls.expectEmptyOrTable();
  });

  test("TC-CL-N106 @low @negative — Invalid calls sub-route shows 404 or redirects", async ({
    page,
  }) => {
    await page.goto("/vap/calls/this-id-does-not-exist");
    await expect(
      page
        .getByText(/404|not found|Calls|No calls found/i)
        .first(),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("TC-AN-201 @critical @security @manual — Cross-org call logs via API", async () => {
    test.skip(true, "Manual/API: access another org call ID");
  });

  test("TC-AN-202 @critical @security @manual — PII redaction in transcripts", async () => {
    test.skip(true, "Manual: verify PII masked in stored transcript");
  });

  test("TC-AN-203 @high @security @manual — Transcript not cached in browser", async () => {
    test.skip(true, "Manual: inspect browser storage after viewing transcript");
  });

  test("TC-VC-201 @critical @security @manual — PII encryption at rest", async () => {
    test.skip(true, "Manual/infra: inspect DB encryption for transcripts");
  });
});
