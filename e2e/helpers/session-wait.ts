import { Page, expect } from "@playwright/test";
import { appPath } from "./app-path";
import { gotoApp, isClerkHostedSignIn } from "./navigate";

export async function waitForAppReady(page: Page): Promise<void> {
  // Sidebar nav link only — .or(heading) breaks strict mode when both are visible on /agents.
  await expect(page.getByRole("link", { name: "Agents" })).toBeVisible({
    timeout: 45_000,
  });
}

export async function isSignedInApp(page: Page): Promise<boolean> {
  if (isClerkHostedSignIn(page.url())) return false;

  return page
    .getByRole("link", { name: "Agents" })
    .isVisible({ timeout: 5_000 })
    .catch(() => false);
}

/**
 * Load SPA root and give Clerk time to refresh __session from __client cookie.
 * Avoid deep-linking to /vap/agents first — staging nginx breaks that route.
 */
export async function initAppSession(page: Page): Promise<void> {
  await page.goto(appPath(""), { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle").catch(() => undefined);
  await page.waitForTimeout(2_000);

  if (isClerkHostedSignIn(page.url())) return;

  const loading = await page
    .getByText(/^Loading\.\.\.$/i)
    .isVisible({ timeout: 1_000 })
    .catch(() => false);
  if (loading) {
    await page.goto(appPath(""), { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2_000);
  }
}

export async function waitForSignedInApp(page: Page): Promise<void> {
  await initAppSession(page);

  if (isClerkHostedSignIn(page.url())) {
    throw sessionExpiredError();
  }

  if (!(await isSignedInApp(page))) {
    await gotoApp(page, "agents");
  }

  await waitForAppReady(page);
}

export function sessionExpiredError(): Error {
  return new Error(
    [
      "Saved session expired or invalid.",
      "",
      "Clerk session tokens are short-lived (~60 seconds).",
      "Run auth:save, then start tests within 1–2 minutes:",
      "",
      "  npm run auth:save",
      "  E2E_USE_SAVED_AUTH=true npm test",
      "",
      "Or validate immediately after saving:",
      "  npm run auth:save && E2E_USE_SAVED_AUTH=true npx playwright test e2e/auth.setup.ts --project=setup",
    ].join("\n"),
  );
}

export async function expectUnsignedBlocked(page: Page, route: string): Promise<void> {
  await gotoApp(page, route);
  await expect(page).toHaveURL(/sign-in|accounts\.shunyalabs\.ai/i, {
    timeout: 30_000,
  });
}
