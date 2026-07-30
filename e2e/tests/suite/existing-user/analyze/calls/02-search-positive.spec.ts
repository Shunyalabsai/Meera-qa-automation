import { test, expect } from "@playwright/test";
import { openCallsList } from "../../../../../helpers/calls.helper";
import { skipUnlessHasCallRecords } from "../../../../../helpers/existing-user.helper";
import { INVALID_UUID } from "../../../../../utils/test-data";

test.describe("ANALYZE › Calls — Search with data @journey @existing-user @calls @positive", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await skipUnlessHasCallRecords(page, testInfo);
  });

  test("TC-CL-EU-020 @high @positive — Search known call ID from table", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    const callId = await calls.firstCallIdFromTable();
    test.skip(!callId, "No call ID link in table");

    await calls.searchByCallIdGo(callId!);
    await expect(page).toHaveURL(/\/calls\//, { timeout: 15_000 });
    await expect(
      page.getByRole("heading", { name: /Call detail/i }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(callId!, { exact: false })).toBeVisible();
  });

  test("TC-CL-EU-021 @medium @positive — Unknown UUID returns no results", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    await calls.searchByCallId(INVALID_UUID);
    await calls.expectCallIdSearchNoResult();
  });

  test("TC-CL-EU-022 @medium @positive — Date range filter keeps page stable", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    const from = calls.dateFromInput();
    test.skip(
      !(await from.isVisible({ timeout: 5_000 }).catch(() => false)),
      "Date filters not exposed",
    );

    await calls.fillDateFrom("2020-01-01");
    await calls.fillDateTo("2030-12-31");
    await calls.dateToInput().press("Enter");
    await calls.expectPageHeader();
    await calls.expectEmptyOrTable();
  });
});
