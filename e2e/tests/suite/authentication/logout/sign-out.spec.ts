import { test, expect } from "@playwright/test";
import { gotoApp } from "../../../../helpers/navigate";

test.describe("Authentication › Logout @smoke", () => {
  test("TC-AU-004 @high @positive — Logout clears session", async ({ page }) => {
    await gotoApp(page, "agents");

    const userButton = page
      .locator(".cl-userButtonTrigger, .cl-userButtonBox")
      .first()
      .or(page.getByRole("button", { name: /open user/i }));

    await expect(userButton).toBeVisible({ timeout: 30_000 });
    await userButton.click();

    const signOut = page.getByRole("menuitem", { name: /sign out|log out/i });
    await expect(signOut).toBeVisible({ timeout: 10_000 });
    await signOut.click();

    await expect(page).toHaveURL(/sign-in|accounts\.shunyalabs\.ai/i, {
      timeout: 30_000,
    });
  });
});
