import { test } from "@playwright/test";
import { LiveCallsPage } from "../../../../pages/live-calls.page";

test.describe("RUN › Live Calls @smoke", () => {
  test("TC-AN-006 @high @positive — Live Calls dashboard loads", async ({
    page,
  }) => {
    const liveCalls = new LiveCallsPage(page);
    await liveCalls.open();
  });
});
