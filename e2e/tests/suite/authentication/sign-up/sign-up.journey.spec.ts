import { test, expect } from "@playwright/test";
import {
  gotoSignUp,
  gotoApp,
} from "../../../../helpers/navigate";
import {
  fillSignUpEmail,
  fillSignUpPassword,
  submitSignUpContinue,
  VALID_SIGNUP_PASSWORD,
} from "../../../../helpers/clerk-auth";
import { expectNewUserAgentsDashboard } from "../../../../helpers/new-user-dashboard";

/**
 * Full new-user journey (requires manual OTP or pre-verified test account).
 *
 * Steps:
 *  1. Sign-up landing → email + password → Continue
 *  2. Verify email → enter OTP from inbox
 *  3. Redirect to BUILD › Agents onboarding dashboard
 *
 * Set E2E_SIGNUP_EMAIL + E2E_SIGNUP_OTP in .env for automated run,
 * or use test.skip and complete OTP manually in headed mode.
 */
test.describe("Authentication › New user journey @journey @manual", () => {
  test("TC-AU-SU-009 @critical @positive — Sign-up completes and lands on Agents dashboard", async ({
    page,
  }) => {
    const email = process.env.E2E_SIGNUP_EMAIL;
    const otp = process.env.E2E_SIGNUP_OTP;

    test.skip(
      !email || !otp,
      "Set E2E_SIGNUP_EMAIL and E2E_SIGNUP_OTP for full journey (or run headed and pause at OTP)",
    );

    await gotoSignUp(page);
    await fillSignUpEmail(page, email!);
    await fillSignUpPassword(page, VALID_SIGNUP_PASSWORD);
    await submitSignUpContinue(page);

    const otpInputs = page.locator(
      'input[inputmode="numeric"], input[autocomplete="one-time-code"], .cl-otpCodeFieldInput',
    );
    await expect(otpInputs.first()).toBeVisible({ timeout: 30_000 });

    const code = otp!.replace(/\s/g, "");
    for (let i = 0; i < code.length; i++) {
      await otpInputs.nth(i).fill(code[i]);
    }

    await page.getByRole("button", { name: /^Continue$/i }).click();
    await page.waitForURL(/meera-stage.*\/vap/i, { timeout: 60_000 });

    await gotoApp(page, "agents");
    await expectNewUserAgentsDashboard(page);
  });
});
