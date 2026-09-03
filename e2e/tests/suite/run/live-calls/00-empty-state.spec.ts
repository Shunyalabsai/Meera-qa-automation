import { test, expect } from "@playwright/test";
import { LiveCallsPage } from "../../../../pages/live-calls.page";
import { isLiveCallsEmptyState } from "../../../../helpers/live-calls.helper";
import { LIVE_CALLS_COPY } from "../../../../data/live-calls-data";

test.describe("RUN › Live Calls — Empty state @journey @new-user @live-calls @smoke", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(
      !(await isLiveCallsEmptyState(page)),
      "Active calls in progress — empty state not shown",
    );
  });

  test("TC-LC-001 @smoke @high @ui — Empty state shows No calls in progress right now", async ({
    page,
  }) => {
    const liveCalls = new LiveCallsPage(page);
    await liveCalls.expectEmptyState();
  });

  test("TC-LC-002 @high @ui — Header and in-flight monitoring subtitle", async ({
    page,
  }) => {
    const liveCalls = new LiveCallsPage(page);
    await liveCalls.expectPageHeader();
    await expect(
      page.getByText(/Click any row to watch the conversation/i).first(),
    ).toBeVisible();
  });

  test("TC-LC-003 @medium @ui — Hint mentions Playground and /api/calls", async ({
    page,
  }) => {
    await expect(page.getByText(LIVE_CALLS_COPY.playgroundHint).first()).toBeVisible();
    await expect(page.getByText(LIVE_CALLS_COPY.apiHint).first()).toBeVisible();
  });

  test("TC-LC-004 @medium @ui — Sidebar Live Calls nav link visible", async ({
    page,
  }) => {
    const liveCalls = new LiveCallsPage(page);
    await liveCalls.open();
    await expect(
      page.getByRole("link", { name: /^Live Calls$/i }),
    ).toBeVisible();
  });

  test("TC-AN-006 @high @positive — Real-time call monitoring dashboard loads", async ({
    page,
  }) => {
    const liveCalls = new LiveCallsPage(page);
    await liveCalls.expectEmptyState();
    await liveCalls.expectNoActiveCallRows();
  });
});
