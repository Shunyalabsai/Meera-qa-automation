import { test, expect } from "@playwright/test";
import { openLiveCalls } from "../../../../helpers/live-calls.helper";
import { LiveCallsPage } from "../../../../pages/live-calls.page";

test.describe("RUN › Live Calls — Positive @journey @new-user @live-calls @positive", () => {
  test("TC-LC-010 @high @positive — Page loads at /live-calls", async ({
    page,
  }) => {
    await openLiveCalls(page);
    await expect(page).toHaveURL(/\/live-calls/);
  });

  test("TC-LC-011 @medium @positive — Navigate to Playground from sidebar", async ({
    page,
  }) => {
    await openLiveCalls(page);
    await page.getByRole("link", { name: /^Playground$/i }).click();
    await expect(page).toHaveURL(/\/playground/, { timeout: 30_000 });
    await expect(
      page.getByRole("heading", { name: /Playground/i }),
    ).toBeVisible();
  });

  test("TC-LC-012 @medium @positive — Playground link in empty state hint if clickable", async ({
    page,
  }) => {
    const liveCalls = await openLiveCalls(page);
    test.skip(
      !(await liveCalls.isEmptyState()),
      "No empty state — calls may be in progress",
    );

    const link = liveCalls.playgroundLink();
    if (await link.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await link.click();
      await expect(page).toHaveURL(/\/playground/, { timeout: 30_000 });
    }
  });

  test("TC-VC-001 @critical @positive @manual — Inbound call appears within seconds", async () => {
    test.skip(
      true,
      "Manual/telephony: start call from Playground or /api/calls — verify row appears on Live Calls",
    );
  });

  test("TC-LC-013 @medium @positive @manual — Click active row opens live conversation view", async () => {
    test.skip(true, "Manual: with active call, click row and verify live transcript/audio");
  });
});
