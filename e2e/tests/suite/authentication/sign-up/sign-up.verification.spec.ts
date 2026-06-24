import { test, expect } from "@playwright/test";
import { gotoSignUp } from "../../../../helpers/navigate";
import {
  expectVerifyEmailScreen,
  fillSignUpEmail,
  fillSignUpPassword,
  submitSignUpContinue,
  VALID_SIGNUP_PASSWORD,
  waitForSignUpAfterContinue,
} from "../../../../helpers/clerk-auth";

test.describe("Authentication › Sign Up — Email verification @unsigned", () => {
  test("TC-AU-SU-008 @high @positive — Continue opens Verify your email screen", async ({
    page,
  }, testInfo) => {
    const email = `e2e-verify-${Date.now()}@yopmail.com`;

    await gotoSignUp(page);
    await fillSignUpEmail(page, email);
    await fillSignUpPassword(page, VALID_SIGNUP_PASSWORD);
    await submitSignUpContinue(page);

    const step = await waitForSignUpAfterContinue(page);
    if (step === "captcha") {
      testInfo.skip(
        true,
        "Cloudflare Turnstile CAPTCHA appeared — complete manually in headed mode or configure Clerk testing bypass",
      );
    }
    if (step === "form") {
      throw new Error("Sign-up Continue did not reach email verification — check email/password validation");
    }

    await expectVerifyEmailScreen(page, email);

    const otpBoxes = page.locator(
      'input[inputmode="numeric"], input[autocomplete="one-time-code"], .cl-otpCodeFieldInput',
    );
    await expect(otpBoxes).toHaveCount(6, { timeout: 15_000 });

    await expect(page.getByText(/Resend/i)).toBeVisible();
  });
});
