import { Page, expect } from "@playwright/test";

export function clerkSignInRoot(page: Page) {
  return page.locator(".cl-signIn-root, .cl-rootBox").first();
}

export function clerkSignUpRoot(page: Page) {
  return page.locator(".cl-signUp-root, .cl-rootBox").first();
}

export async function expectSignInForm(page: Page): Promise<void> {
  await expect(
    page.getByRole("heading", { name: /Sign in to Shunya Labs/i }),
  ).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole("button", { name: /Google/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /GitHub/i })).toBeVisible();
  await expect(page.getByRole("textbox", { name: /email/i })).toBeVisible();
}

export async function expectSignUpForm(page: Page): Promise<void> {
  await expect(
    page.getByRole("heading", { name: /Create your account/i }),
  ).toBeVisible({ timeout: 30_000 });
  await expect(
    page.getByText(/Welcome! Please fill in the details to get started/i),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /Google/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /GitHub/i })).toBeVisible();
  await expect(page.getByRole("textbox", { name: /email/i })).toBeVisible();
  await expect(page.getByRole("textbox", { name: /password/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Continue$/i })).toBeVisible();
}

export async function expectVerifyEmailScreen(page: Page, email: string): Promise<void> {
  await expect(
    page.getByRole("heading", { name: /verify your email|check your email/i }),
  ).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(email, { exact: false })).toBeVisible();

  const otpInputs = page.locator(
    'input[inputmode="numeric"], input[autocomplete="one-time-code"], .cl-otpCodeFieldInput',
  );
  await expect(otpInputs.first()).toBeVisible();
  await expect(page.getByText(/Didn't receive a code|Resend/i)).toBeVisible();
}

export type SignUpContinueResult = "verify" | "captcha" | "form";

/** After sign-up Continue — verify screen, Turnstile CAPTCHA, or still on form. */
export async function waitForSignUpAfterContinue(page: Page): Promise<SignUpContinueResult> {
  const verifyHeading = page.getByRole("heading", {
    name: /verify your email|check your email/i,
  });
  const emailField = page.getByRole("textbox", { name: /email/i });

  try {
    const result = await Promise.race([
      verifyHeading.waitFor({ state: "visible", timeout: 15_000 }).then(() => "verify" as const),
      emailField.waitFor({ state: "hidden", timeout: 15_000 }).then(() => "captcha" as const),
    ]);
    return result;
  } catch {
    if (await verifyHeading.isVisible().catch(() => false)) return "verify";
    if (await isCloudflareTurnstileChallenge(page)) return "captcha";
    return "form";
  }
}

export async function isCloudflareTurnstileChallenge(page: Page): Promise<boolean> {
  if (
    await page
      .getByText(/verify you are human/i)
      .isVisible({ timeout: 2_000 })
      .catch(() => false)
  ) {
    return true;
  }

  const cfFrame = page.locator(
    'iframe[src*="cloudflare"], iframe[title*="Cloudflare"], iframe[title*="Widget"]',
  );
  if ((await cfFrame.count()) > 0) {
    return cfFrame.first().isVisible({ timeout: 2_000 }).catch(() => false);
  }

  // Turnstile replaces the form: sign-up heading remains but email/password inputs vanish.
  const onSignUp = await page
    .getByRole("heading", { name: /Create your account/i })
    .isVisible({ timeout: 1_000 })
    .catch(() => false);
  const hasEmailField = await page
    .getByRole("textbox", { name: /email/i })
    .isVisible({ timeout: 1_000 })
    .catch(() => false);
  const onVerify = await page
    .getByRole("heading", { name: /verify your email|check your email/i })
    .isVisible({ timeout: 1_000 })
    .catch(() => false);

  return onSignUp && !hasEmailField && !onVerify;
}

/** Clerk sign-up blocks empty email without always showing helper text. */
export async function expectBlankSignUpBlocked(page: Page): Promise<void> {
  await expect(
    page.getByRole("heading", { name: /Create your account/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /verify your email|check your email/i }),
  ).not.toBeVisible();
  await expect(page.getByRole("textbox", { name: /email/i })).toHaveValue("");
}

export async function fillSignUpEmail(page: Page, value: string): Promise<void> {
  await page.getByRole("textbox", { name: /email/i }).fill(value);
}

export async function fillSignUpPassword(page: Page, value: string): Promise<void> {
  await page.getByRole("textbox", { name: /password/i }).fill(value);
}

export async function submitSignUpContinue(page: Page): Promise<void> {
  await page.getByRole("button", { name: /^Continue$/i }).click();
}

export async function submitBlankSignIn(page: Page): Promise<void> {
  await submitSignInContinue(page);
}

/** Clerk hosted sign-in blocks empty email without always showing helper text. */
export async function expectBlankSignInBlocked(page: Page): Promise<void> {
  await expect(
    page.getByRole("heading", { name: /Sign in to Shunya Labs|Sign in/i }),
  ).toBeVisible();

  await expect(
    page.getByRole("heading", { name: /enter your password|check your email/i }),
  ).not.toBeVisible();

  await expect(page.getByRole("textbox", { name: /email/i })).toHaveValue("");
}

export async function submitSignInContinue(page: Page): Promise<void> {
  await page.getByRole("button", { name: /^Continue$/i }).click();
}

async function isSignInPasswordVisible(page: Page): Promise<boolean> {
  return page
    .getByRole("textbox", { name: /password/i })
    .isVisible({ timeout: 500 })
    .catch(() => false);
}

/** Clerk hosted sign-in hides password until email step Continue is clicked. */
async function trySwitchToPasswordFromEmailCode(page: Page): Promise<void> {
  const onEmailCode = await page
    .getByRole("heading", { name: /check your email/i })
    .isVisible({ timeout: 2_000 })
    .catch(() => false);
  if (!onEmailCode) return;

  const useAnother = page.getByRole("link", { name: /use another method/i });
  if (!(await useAnother.isVisible({ timeout: 2_000 }).catch(() => false))) return;

  await useAnother.click();
  const passwordBtn = page.getByRole("button", { name: /^Password$/i });
  if (await passwordBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await passwordBtn.click();
  }
}

export async function advanceSignInToPasswordStep(page: Page): Promise<void> {
  if (await isSignInPasswordVisible(page)) return;
  await submitSignInContinue(page);
  await trySwitchToPasswordFromEmailCode(page);
  if (await isSignInPasswordVisible(page)) return;
  await page
    .getByRole("textbox", { name: /password/i })
    .waitFor({ state: "visible", timeout: 15_000 });
}

export async function fillSignInEmail(page: Page, value: string): Promise<void> {
  await page.getByRole("textbox", { name: /email/i }).fill(value);
}

export async function fillSignInPassword(page: Page, value: string): Promise<void> {
  await advanceSignInToPasswordStep(page);
  await page.getByRole("textbox", { name: /password/i }).fill(value);
}

export async function isSignInEmailCodeStep(
  page: Page,
  timeoutMs = 1_000,
): Promise<boolean> {
  return page
    .getByRole("heading", { name: /check your email/i })
    .isVisible({ timeout: timeoutMs })
    .catch(() => false);
}

export async function fillSignInEmailCode(page: Page, code: string): Promise<void> {
  await page.getByRole("textbox", { name: /verification code|enter verification code/i }).fill(code);
}

/** After password submit, wait for dashboard or second-factor email OTP. */
export async function completeSignInEmailCodeIfShown(
  page: Page,
  otp?: string,
): Promise<boolean> {
  const agents = page.getByRole("link", { name: "Agents" });
  const otpHeading = page.getByRole("heading", { name: /check your email/i });

  const outcome = await Promise.race([
    agents.waitFor({ state: "visible", timeout: 45_000 }).then(() => "app" as const),
    otpHeading.waitFor({ state: "visible", timeout: 45_000 }).then(() => "otp" as const),
  ]).catch(() => "unknown" as const);

  if (outcome === "app") return false;
  if (outcome !== "otp") return false;

  if (!otp) return true;

  await fillSignInEmailCode(page, otp);
  await submitSignInContinue(page);
  return false;
}

export async function clickGoogleSso(page: Page): Promise<void> {
  await page.getByRole("button", { name: /Google/i }).click();
}

/** Strong password that satisfies Clerk default rules on staging. */
export const VALID_SIGNUP_PASSWORD = "MeeraE2E!Test2026";
