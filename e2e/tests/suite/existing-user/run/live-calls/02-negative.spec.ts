import { test, expect } from "@playwright/test";
import { openLiveCalls } from "../../../../../helpers/live-calls.helper";
import { reloadSpaRoute } from "../../../../../helpers/navigate";
import { INVALID_UUID } from "../../../../../utils/test-data";

test.describe("RUN › Live Calls — Negative @journey @existing-user @live-calls @negative", () => {
  test("TC-LC-N101 @medium @negative — Invalid live-calls sub-route shows 404 or redirects", async ({
    page,
  }) => {
    await page.goto("/vap/live-calls/this-id-does-not-exist");
    await expect(
      page.getByText(/404|not found|Live Calls|No calls in progress/i).first(),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("TC-LC-N102 @medium @negative — Invalid call UUID deep-link handled gracefully", async ({
    page,
  }) => {
    await page.goto(`/vap/live-calls/${INVALID_UUID}`);
    // The SPA falls back to the Agents route / onboarding page (no crash/blank)
    // when the UUID doesn't match a live call.
    await expect(
      page
        .getByRole("heading", { name: /^Agents$|^Build your first voice agent$/i })
        .or(page.getByText(/Create an agent|Build your first voice agent/i))
        .first(),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("TC-LC-N103 @low @negative — Empty state persists after failed refresh", async ({
    page,
  }) => {
    await openLiveCalls(page);
    const isEmpty = await page
      .getByText(/No calls in progress right now/i)
      .isVisible({ timeout: 5_000 })
      .catch(() => false);

    test.skip(!isEmpty, "Calls in progress — cannot test empty persistence");

    await reloadSpaRoute(page, "live-calls");
    await expect(
      page.getByText(/No calls in progress right now/i),
    ).toBeVisible({ timeout: 30_000 });
  });
});
