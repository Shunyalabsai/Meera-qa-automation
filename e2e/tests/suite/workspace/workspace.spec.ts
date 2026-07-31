import { test, expect } from "@playwright/test";
import { gotoApp } from "../../../helpers/navigate";

test.describe("Workspace & Account @smoke", () => {
  test("Account menu opens from user button", async ({ page }) => {
    await gotoApp(page, "agents");
    // The account/workspace controls live in the user menu — no org switcher in the sidebar.
    await page.getByRole("button", { name: /Open user menu|User menu/i }).click();
    await expect(page.getByText(/Manage account/i)).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/Sign out/i)).toBeVisible();
  });

  test("User profile button is present", async ({ page }) => {
    await gotoApp(page, "agents");
    await expect(
      page.locator(".cl-userButtonTrigger, .cl-userButtonBox").first(),
    ).toBeVisible({ timeout: 30_000 });
  });
});
