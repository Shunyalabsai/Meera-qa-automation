export function getGoogleEmail(): string {
  const email = process.env.E2E_GOOGLE_EMAIL;
  if (!email) {
    throw new Error("Set E2E_GOOGLE_EMAIL in .env");
  }
  return email;
}

/** True when a dedicated email+password Clerk test account is configured. */
export function hasPasswordSignInCredentials(): boolean {
  return !!(process.env.E2E_CLERK_EMAIL && process.env.E2E_CLERK_PASSWORD);
}

/** Email+password sign-in only — not for Google SSO / email-OTP accounts. */
export function getPasswordSignInCredentials(): { email: string; password: string } {
  const email = process.env.E2E_CLERK_EMAIL;
  const password = process.env.E2E_CLERK_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Set E2E_CLERK_EMAIL + E2E_CLERK_PASSWORD for email/password sign-in tests",
    );
  }

  return { email, password };
}
