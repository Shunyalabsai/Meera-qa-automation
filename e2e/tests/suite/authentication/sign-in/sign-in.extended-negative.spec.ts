import { test, expect } from "@playwright/test";
import { gotoSignIn } from "../../../../helpers/navigate";
import {
  fillSignInEmail,
  fillSignInPassword,
  submitSignInContinue,
} from "../../../../helpers/clerk-auth";
import { getPasswordSignInCredentials, hasPasswordSignInCredentials } from "../../../../helpers/credentials";

test.describe("Authentication › Sign In — Extended negative @unsigned @negative", () => {
  test("TC-AU-102 @high @negative — Login with unregistered email", async ({
    page,
  }) => {
    await gotoSignIn(page);
    await fillSignInEmail(page, `no-such-user-${Date.now()}@example.invalid`);
    await submitSignInContinue(page);

    await expect(
      page.getByText(/couldn't|could not|not found|invalid|incorrect|no account/i).first(),
    ).toBeVisible({ timeout: 25_000 });
  });

  test("TC-AU-104 @medium @negative — Password field with only spaces", async ({
    page,
  }) => {
    test.skip(
      !hasPasswordSignInCredentials(),
      "Requires E2E_CLERK_EMAIL + E2E_CLERK_PASSWORD — Google SSO accounts use email OTP, not password",
    );

    const { email } = getPasswordSignInCredentials();
    await gotoSignIn(page);
    await fillSignInEmail(page, email);
    await fillSignInPassword(page, "     ");
    await submitSignInContinue(page);

    await expect(
      page.getByText(/required|invalid|password|enter/i).first(),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("TC-AU-201 @high @security @negative — SQL injection in email field", async ({
    page,
  }) => {
    await gotoSignIn(page);
    await fillSignInEmail(page, "' OR '1'='1");
    await submitSignInContinue(page);
    await expect(page.getByRole("heading", { name: /Sign in to Shunya Labs/i })).toBeVisible({
      timeout: 10_000,
    });
  });
});
