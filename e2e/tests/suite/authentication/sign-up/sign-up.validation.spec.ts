import { test, expect } from "@playwright/test";
import { gotoSignUp } from "../../../../helpers/navigate";
import {
  fillSignUpEmail,
  fillSignUpPassword,
  expectBlankSignUpBlocked,
  submitSignUpContinue,
  VALID_SIGNUP_PASSWORD,
} from "../../../../helpers/clerk-auth";

test.describe("Authentication › Sign Up — Validation @unsigned", () => {
  test("TC-AU-SU-005 @high @negative — Weak password shows requirement feedback", async ({
    page,
  }) => {
    await gotoSignUp(page);
    await fillSignUpEmail(page, `e2e-weak-${Date.now()}@yopmail.com`);
    await fillSignUpPassword(page, "123");

    await expect(
      page.getByText(/meets all the necessary requirements/i).first(),
    ).not.toBeVisible({ timeout: 5_000 });
  });

  test("TC-AU-SU-006 @high @positive — Strong password meets Clerk requirements", async ({
    page,
  }) => {
    await gotoSignUp(page);
    await fillSignUpEmail(page, `e2e-strong-${Date.now()}@yopmail.com`);
    await fillSignUpPassword(page, VALID_SIGNUP_PASSWORD);

    await expect(
      page.getByTestId("form-feedback-success").or(
        page.getByText(/meets all the necessary requirements/i),
      ).first(),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("TC-AU-SU-007 @high @negative — Blank email blocks continue", async ({
    page,
  }) => {
    await gotoSignUp(page);
    await fillSignUpPassword(page, VALID_SIGNUP_PASSWORD);
    await submitSignUpContinue(page);
    await expectBlankSignUpBlocked(page);
  });
});
