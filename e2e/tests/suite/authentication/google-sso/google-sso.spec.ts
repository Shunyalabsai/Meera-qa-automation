import { test, expect } from "@playwright/test";
import { gotoApp } from "../../../../helpers/navigate";
import { waitForAppReady } from "../../../../helpers/session-wait";

test.describe("Authentication › Google SSO", () => {
  test("TC-AU-002b @high @positive — Saved session reaches BUILD › Agents", async ({
    page,
  }) => {
    test.skip(
      process.env.E2E_USE_SAVED_AUTH !== "true",
      "Enable E2E_USE_SAVED_AUTH=true after npm run auth:save",
    );

    await gotoApp(page, "agents");
    await waitForAppReady(page);
    await expect(
      page
        .getByRole("heading", { name: /^Agents$|^Build your first voice agent$/i })
        .or(page.getByText(/Create an agent|Build your first voice agent|Agents/i))
        .first(),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: /Voice Agent Platform/i })).toBeVisible();
  });
});
