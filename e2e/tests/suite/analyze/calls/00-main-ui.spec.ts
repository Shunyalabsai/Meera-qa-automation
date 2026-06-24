import { test, expect } from "@playwright/test";
import { CallsListPage } from "../../../../pages/calls-list.page";
import { isCallsEmptyState } from "../../../../helpers/calls.helper";
import { CALLS_COPY } from "../../../../data/calls-filter-data";

test.describe("ANALYZE › Calls — Main UI @journey @new-user @calls", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(
      !(await isCallsEmptyState(page)),
      "Call records exist — empty state not shown",
    );
  });

  test("TC-CL-001 @high @ui — Empty state shows No calls found", async ({
    page,
  }) => {
    const calls = new CallsListPage(page);
    await calls.expectEmptyState();
  });

  test("TC-CL-002 @high @ui — Header and result counter (0 shown)", async ({
    page,
  }) => {
    const calls = new CallsListPage(page);
    await calls.expectPageHeader();
    await expect(calls.shownCount()).toContainText(/0\s+shown/i);
  });

  test("TC-CL-003 @high @ui — All search and filter controls visible", async ({
    page,
  }) => {
    const calls = new CallsListPage(page);
    await calls.open();
    await calls.expectAllFiltersVisible();
    await expect(page.getByText(CALLS_COPY.searchHint).first()).toBeVisible();
  });

  test("TC-CL-004 @medium @ui — Call ID search has Go button", async ({
    page,
  }) => {
    const calls = new CallsListPage(page);
    await calls.open();
    await expect(calls.callIdSearchInput()).toBeVisible();
    await expect(calls.goButton()).toBeVisible();
    await expect(calls.goButton()).toBeEnabled();
  });

  test("TC-CL-005 @medium @ui — Sidebar Calls nav link visible", async ({
    page,
  }) => {
    const calls = new CallsListPage(page);
    await calls.open();
    await expect(page.getByRole("link", { name: /^Calls$/i })).toBeVisible();
  });
});
