import { test, expect } from "@playwright/test";
import { openCallsList } from "../../../../../helpers/calls.helper";
import { skipUnlessHasCallRecords } from "../../../../../helpers/existing-user.helper";

test.describe("ANALYZE › Calls — Populated list @journey @existing-user @calls @ui", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await skipUnlessHasCallRecords(page, testInfo);
  });

  test("TC-CL-EU-001 @high @ui — Call table visible with records", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    await calls.expectHasCallRecords();
  });

  test("TC-CL-EU-002 @high @ui — Shown count reflects live data", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    const count = await calls.parseShownCount();
    expect(count).toBeGreaterThan(0);
  });

  test("TC-CL-EU-003 @high @ui — All filters visible with populated list", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    await calls.expectAllFiltersVisible();
    await calls.expectHasCallRecords();
  });

  test("TC-CL-EU-004 @medium @ui — First row has navigable call link", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    const callId = await calls.firstCallIdFromTable();
    expect(callId).toBeTruthy();
    await expect(calls.callsTable().getByRole("link").first()).toBeVisible();
  });
});
