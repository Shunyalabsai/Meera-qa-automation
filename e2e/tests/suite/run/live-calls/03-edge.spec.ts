import { test, expect } from "@playwright/test";
import { openLiveCalls } from "../../../../helpers/live-calls.helper";
import { reloadSpaRoute } from "../../../../helpers/navigate";

test.describe("RUN › Live Calls — Edge @journey @new-user @live-calls @edge", () => {
  test("TC-LC-E101 @medium @edge — Navigate away and back preserves empty state", async ({
    page,
  }) => {
    const liveCalls = await openLiveCalls(page);
    test.skip(
      !(await liveCalls.isEmptyState()),
      "Active calls in progress",
    );

    await page.getByRole("link", { name: /^Agents$/i }).click();
    await expect(page).toHaveURL(/\/agents/, { timeout: 30_000 });
    await page.getByRole("link", { name: /^Live Calls$/i }).click();
    await liveCalls.expectEmptyState();
  });

  test("TC-LC-E102 @medium @edge — RUN section siblings reachable from Live Calls", async ({
    page,
  }) => {
    await openLiveCalls(page);
    await page.getByRole("link", { name: /^Campaigns$/i }).click();
    await expect(page).toHaveURL(/\/campaigns/, { timeout: 30_000 });
    await page.getByRole("link", { name: /^Phone numbers$/i }).click();
    await expect(page).toHaveURL(/\/phone-numbers/, { timeout: 30_000 });
  });

  test("TC-LC-E103 @low @edge — Page reload keeps Live Calls heading", async ({
    page,
  }) => {
    await openLiveCalls(page);
    await reloadSpaRoute(page, "live-calls");
    await expect(
      page.getByRole("heading", { name: /Live Calls/i }),
    ).toBeVisible({ timeout: 30_000 });
  });

});
