import { test, expect } from "@playwright/test";
import { openLiveCalls } from "../../../../../helpers/live-calls.helper";

test.describe("RUN › Live Calls — CTA functional @journey @existing-user @live-calls @cta", () => {
  test("CTA-LC-001 @high @cta — Playground sidebar link from Live Calls", async ({
    page,
  }) => {
    await openLiveCalls(page);
    await page.getByRole("link", { name: /^Playground$/i }).click();
    await expect(page).toHaveURL(/\/playground/, { timeout: 30_000 });
  });

  test("CTA-LC-002 @medium @cta — Playground hint link in empty state if present", async ({
    page,
  }) => {
    const liveCalls = await openLiveCalls(page);
    const link = liveCalls.playgroundLink();
    test.skip(
      !(await link.isVisible({ timeout: 3_000 }).catch(() => false)),
      "No Playground link in empty state",
    );
    await link.click();
    await expect(page).toHaveURL(/\/playground/, { timeout: 30_000 });
  });
});
