import { test as setup } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { appPath } from "./helpers/app-path";
import { getGoogleEmail } from "./helpers/credentials";
import { gotoApp, gotoSignIn } from "./helpers/navigate";
import { isSignedInApp, waitForSignedInApp, initAppSession } from "./helpers/session-wait";

const authFile = path.join(__dirname, "../.auth/user.json");

function printManualSteps(email: string) {
  // eslint-disable-next-line no-console
  console.log(`
========================================
  MANUAL GOOGLE SIGN-IN REQUIRED
========================================
  1. Use the Chrome window that just opened
  2. Click "Sign in with Google"
  3. Choose account: ${email}
  4. Complete password / 2FA if asked
  5. Wait until the Agents dashboard appears
     (script saves automatically — do not close the browser)
========================================
`);
}

/** Staging nginx has no SPA fallback on /vap/agents — recover to /vap/ root. */
async function recoverFromStuckLoading(page: import("@playwright/test").Page) {
  const url = page.url();
  const loading = await page
    .getByText(/^Loading\.\.\.$/i)
    .isVisible({ timeout: 1_000 })
    .catch(() => false);

  if (
    loading ||
    (url.includes("agents.shunya") && url.includes("/agents") && !(await isSignedInApp(page)))
  ) {
    await page.goto(appPath(""), { waitUntil: "domcontentloaded" });
  }
}

setup("save Google SSO session", async ({ page, context }) => {
  setup.setTimeout(300_000);
  fs.mkdirSync(path.dirname(authFile), { recursive: true });

  const email = getGoogleEmail();
  printManualSteps(email);

  // Open Clerk sign-in with redirect to /vap/ (not /vap/agents — avoids Loading… stuck screen)
  await gotoSignIn(page);

  const deadline = Date.now() + 300_000;
  while (Date.now() < deadline) {
    if (await isSignedInApp(page)) break;

    await recoverFromStuckLoading(page);

    if (await isSignedInApp(page)) break;

    await page.waitForTimeout(2_000);
  }

  if (!(await isSignedInApp(page))) {
    await gotoApp(page, "agents");
  }

  if (!(await isSignedInApp(page))) {
    throw new Error(
      [
        "Google SSO did not complete within 5 minutes.",
        "Steps:",
        "  1. Run: npm run auth:save",
        "  2. In the Chrome window, click Google and sign in",
        `  3. Use account: ${email}`,
        "  4. Wait for the Agents sidebar before the window closes",
        "",
        "If you saw a black 'Loading...' screen, the script now retries /vap/ automatically.",
        "Try again and complete Google login in the opened browser.",
      ].join("\n"),
    );
  }

  await waitForSignedInApp(page);

  // Refresh on /vap/ so saved __session JWT is as fresh as possible (Clerk TTL ~60s).
  await initAppSession(page);
  await context.storageState({ path: authFile });

  // eslint-disable-next-line no-console
  console.log("\nSession saved to .auth/user.json\n");
});
