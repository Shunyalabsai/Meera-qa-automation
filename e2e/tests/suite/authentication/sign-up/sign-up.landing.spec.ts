import { test, expect } from "@playwright/test";
import { gotoSignUp } from "../../../../helpers/navigate";
import { expectSignUpForm } from "../../../../helpers/clerk-auth";

test.describe("Authentication › Sign Up — Landing @unsigned @smoke", () => {
  test("TC-AU-SU-001 @high @positive — Create your account screen loads", async ({
    page,
  }) => {
    await gotoSignUp(page);
    await expectSignUpForm(page);
    await expect(page.getByText(/Secured by/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /^Sign in$/i })).toBeVisible();
    await expect(page.getByText(/Already have an account/i)).toBeVisible();
  });

  test("TC-AU-SU-002 @high @positive — Show/hide password toggle visible", async ({
    page,
  }) => {
    await gotoSignUp(page);
    await expect(
      page.getByRole("button", { name: /Show password|Hide password/i }),
    ).toBeVisible();
  });
});
