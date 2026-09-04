import { test, expect } from "@playwright/test";
import { gotoApp } from "../../../../helpers/navigate";
import { waitForAppReady } from "../../../../helpers/session-wait";

test.describe("Authentication › Session", () => {
  test("TC-AU-003 @medium @positive — Session persists across tabs", async ({
    browser,
  }) => {
    const ctx = await browser.newContext({
      storageState: ".auth/user.json",
    });
    const page1 = await ctx.newPage();
    const page2 = await ctx.newPage();

    await gotoApp(page1, "agents");
    await waitForAppReady(page1);

    await gotoApp(page2, "agents");
    await waitForAppReady(page2);

    await expect(page1.getByRole("link", { name: "Agents" })).toBeVisible();
    await expect(page2.getByRole("link", { name: "Agents" })).toBeVisible();
    await ctx.close();
  });
});
