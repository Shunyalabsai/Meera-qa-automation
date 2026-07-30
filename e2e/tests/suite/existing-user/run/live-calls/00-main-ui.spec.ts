import { test, expect } from "@playwright/test";
import { LiveCallsPage } from "../../../../../pages/live-calls.page";
import { skipUnlessHasLiveCalls } from "../../../../../helpers/existing-user.helper";

test.describe("RUN › Live Calls — Populated @journey @existing-user @live-calls @ui", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await skipUnlessHasLiveCalls(page, testInfo);
  });

  test("TC-LC-EU-001 @high @ui — Live calls page not empty", async ({ page }) => {
    const liveCalls = new LiveCallsPage(page);
    await liveCalls.open();
    await expect(page.getByRole("heading", { name: /Live Calls/i })).toBeVisible();
  });
});
