import { test, expect } from "@playwright/test";
import { gotoSignIn } from "../../../../helpers/navigate";
import {
  expectSignInForm,
  fillSignInEmail,
  fillSignInPassword,
  submitSignInContinue,
  completeSignInEmailCodeIfShown,
} from "../../../../helpers/clerk-auth";
import { getPasswordSignInCredentials, hasPasswordSignInCredentials } from "../../../../helpers/credentials";

test.describe("Authentication › Sign In @unsigned", () => {
  test("TC-AU-002 @smoke @high @positive — Sign-in page shows Google, GitHub, and email", async ({
    page,
  }) => {
    await gotoSignIn(page);
    await expect(page.getByRole("heading", { name: /Sign in to Shunya Labs/i })).toBeVisible();
    await expectSignInForm(page);
    await expect(page.getByRole("button", { name: /Google/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /GitHub/i })).toBeVisible();
    await expect(page.getByRole("textbox", { name: /email/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Sign up/i })).toBeVisible();
  });

  test("TC-AU-001 @high @positive — Valid login with email & password", async ({
    page,
  }, testInfo) => {
    test.skip(
      !hasPasswordSignInCredentials(),
      "Requires E2E_CLERK_EMAIL + E2E_CLERK_PASSWORD — Google SSO accounts use email OTP, not password",
    );

    const { email, password } = getPasswordSignInCredentials();
    await gotoSignIn(page);
    await fillSignInEmail(page, email);
    await fillSignInPassword(page, password);
    await submitSignInContinue(page);

    const needsOtp = await completeSignInEmailCodeIfShown(page, process.env.E2E_SIGNIN_OTP);
    if (needsOtp) {
      testInfo.skip(
        true,
        "Clerk sent email OTP (new device). Copy code from yopmail and set E2E_SIGNIN_OTP in .env",
      );
    }

    await expect(page.getByRole("link", { name: "Agents" })).toBeVisible({
      timeout: 60_000,
    });
  });
});
