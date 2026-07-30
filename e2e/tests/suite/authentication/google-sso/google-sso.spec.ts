import { test, expect } from "@playwright/test";
import { gotoApp } from "../../../../helpers/navigate";
import { waitForAppReady } from "../../../../helpers/session-wait";

test.describe("Authentication › Google SSO @smoke", () => {
  test("TC-AU-002b @high @positive — Saved session reaches BUILD › Agents", async ({
    page,
  }) => {
    test.skip(
      process.env.E2E_USE_SAVED_AUTH !== "true",
      "Enable E2E_USE_SAVED_AUTH=true after npm run auth:save",
    );

    await gotoApp(page, "agents");
    await waitForAppReady(page);
    await expect(page.getByRole("heading", { name: "Agents" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Voice Agent Platform/i })).toBeVisible();
  });
});
