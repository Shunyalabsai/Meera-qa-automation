import { test, expect } from "@playwright/test";
import { gotoSignIn } from "../../../../helpers/navigate";
import {
  clerkSignInRoot,
  fillSignInEmail,
  submitSignInContinue,
} from "../../../../helpers/clerk-auth";
import { XSS_PAYLOAD } from "../../../../utils/test-data";

test.describe("Authentication › Sign In (Security) @unsigned", () => {
  test("TC-AU-202 @critical @security — XSS in login fields sanitized", async ({
    page,
  }) => {
    const dialogs: string[] = [];
    page.on("dialog", (d) => {
      dialogs.push(d.message());
      d.dismiss();
    });

    await gotoSignIn(page);
    await fillSignInEmail(page, XSS_PAYLOAD);
    await submitSignInContinue(page);
    await page.waitForTimeout(1_000);

    expect(dialogs).toHaveLength(0);

    // Payload stays literal text in the input — not executed as HTML/script.
    await expect(page.getByRole("textbox", { name: /email/i })).toHaveValue(XSS_PAYLOAD);

    const signInRoot = clerkSignInRoot(page);
    await expect(signInRoot.locator('script:has-text("xss")')).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: /Sign in to Shunya Labs/i }),
    ).toBeVisible();
  });
});
