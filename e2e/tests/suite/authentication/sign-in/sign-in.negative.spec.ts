import { test, expect } from "@playwright/test";
import { gotoSignIn } from "../../../../helpers/navigate";
import {
  fillSignInEmail,
  fillSignInPassword,
  expectBlankSignInBlocked,
  submitBlankSignIn,
  submitSignInContinue,
} from "../../../../helpers/clerk-auth";
import { getPasswordSignInCredentials, hasPasswordSignInCredentials } from "../../../../helpers/credentials";

test.describe("Authentication › Sign In (Negative) @unsigned", () => {
  test("TC-AU-101 @high @negative — Login with wrong password", async ({
    page,
  }) => {
    test.skip(
      !hasPasswordSignInCredentials(),
      "Requires E2E_CLERK_EMAIL + E2E_CLERK_PASSWORD — Google SSO accounts use email OTP, not password",
    );

    const { email } = getPasswordSignInCredentials();
    await gotoSignIn(page);
    await fillSignInEmail(page, email);
    await fillSignInPassword(page, "WrongPassword!999");
    await submitSignInContinue(page);

    await expect(
      page.getByText(/invalid|incorrect|wrong|couldn't|could not/i).first(),
    ).toBeVisible({ timeout: 20_000 });
  });

  test("TC-AU-103 @high @negative — Blank email submission", async ({
    page,
  }) => {
    await gotoSignIn(page);
    await submitBlankSignIn(page);
    await expectBlankSignInBlocked(page);
  });
});
