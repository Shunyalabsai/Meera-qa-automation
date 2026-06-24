import { test, expect } from "@playwright/test";
import {
  gotoSignInFromSignUp,
  gotoSignUpFromSignIn,
} from "../../../../helpers/navigate";
import { expectSignInForm, expectSignUpForm } from "../../../../helpers/clerk-auth";

test.describe("Authentication › Sign Up — Navigation @unsigned", () => {
  test("TC-AU-SU-003 @medium @positive — Sign in link from sign-up", async ({
    page,
  }) => {
    await gotoSignInFromSignUp(page);
    await expectSignInForm(page);
  });

  test("TC-AU-SU-004 @medium @positive — Sign up link from sign-in", async ({
    page,
  }) => {
    await gotoSignUpFromSignIn(page);
    await expectSignUpForm(page);
  });
});
