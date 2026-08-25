import { Page } from "@playwright/test";
import { appPath, normalizeBaseUrl } from "./app-path";
import { sessionExpiredError } from "./session-wait";

const CLERK_ACCOUNTS = "https://accounts.shunyalabs.ai";

/** Sidebar labels for client-side navigation (staging nginx has no SPA fallback on deep links). */
const SIDEBAR_ROUTES: Record<string, RegExp> = {
  agents: /^Agents$/i,
  prompts: /^Prompts$/i,
  playground: /^Playground$/i,
  campaigns: /^Campaigns$/i,
  "phone-numbers": /^Phone numbers$/i,
  "live-calls": /^Live Calls$/i,
  calls: /^Calls$/i,
  recordings: /^Recordings$/i,
  insights: /^Insights$/i,
  alerts: /^Alerts$/i,
  billing: /^Billing$/i,
  "admin/webhooks": /^Webhooks$/i,
};

function redirectUrl(): string {
  const base =
    process.env.PLAYWRIGHT_BASE_URL ?? "https://agents.shunyalabs.ai/vap/";
  return encodeURIComponent(base.endsWith("/") ? base : `${base}/`);
}

async function isSpaShell(page: Page): Promise<boolean> {
  const hasRoot = await page.locator("#root").count().then((n) => n > 0);
  if (hasRoot) return true;
  return page
    .getByRole("link", { name: /^Agents$/i })
    .isVisible({ timeout: 3_000 })
    .catch(() => false);
}

async function isSpaShellBroken(page: Page): Promise<boolean> {
  const notFoundJson = await page
    .getByText(/"detail"\s*:\s*"Not Found"|Not Found/i)
    .isVisible({ timeout: 1_000 })
    .catch(() => false);
  if (notFoundJson) return true;
  return !(await isSpaShell(page));
}

/**
 * Wait for the SPA "Loading…" placeholder to clear before reading/asserting content.
 * The staging app renders the page shell (heading/sidebar) before its async data
 * finishes, so reads taken too early return premature 0/null values and waits for
 * data-dependent content can time out while the spinner is still shown.
 *
 * Best-effort: never throws. A genuinely stuck load is surfaced by the caller's
 * own assertion (which carries its own timeout).
 */
export async function waitForLoadingToClear(
  page: Page,
  timeout = 45_000,
): Promise<void> {
  const loading = page.getByText(/^\s*Loading…?\s*$/i).first();
  try {
    if (await loading.isVisible({ timeout: 1_000 }).catch(() => false)) {
      await loading.waitFor({ state: "hidden", timeout });
    }
  } catch {
    // Spinner still visible after timeout — leave it to the caller's assertion.
  }
}

/** Staging nginx returns 404 JSON on deep-link reload — recover via SPA root + sidebar nav. See STAGING_INFRA SPA-RELOAD in e2e/data/known-issues.mjs */
export async function reloadSpaRoute(page: Page, route: string): Promise<void> {
  await page.reload();
  if (await isSpaShellBroken(page)) {
    await gotoApp(page, route);
  }
}

async function clientNavigate(page: Page, route: string): Promise<void> {
  const base =
    process.env.PLAYWRIGHT_BASE_URL ?? "https://agents.shunyalabs.ai/vap/";
  const basePath = normalizeBaseUrl(base).replace(/^https?:\/\/[^/]+/, "") || "/vap/";
  const target = `${basePath.replace(/\/?$/, "/")}${route.replace(/^\//, "")}`;

  await page.evaluate((path) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, target);
}

export async function dismissOnboardingIfPresent(page: Page): Promise<void> {
  const skipBtn = page.getByRole("button", { name: /^Skip$/i }).or(page.getByText(/^Skip$/i));
  if (await skipBtn.first().isVisible({ timeout: 1_500 }).catch(() => false)) {
    await skipBtn.first().click().catch(() => {});
  }
}

export async function gotoApp(page: Page, route = ""): Promise<void> {
  const trimmed = route.replace(/^\//, "");
  const shellResponse = await page.goto(appPath(""), {
    waitUntil: "domcontentloaded",
  });

  await dismissOnboardingIfPresent(page);

  const shellOk =
    (shellResponse?.ok() ?? false) || (await isSpaShell(page));

  assertSignedIn(page);

  if (!trimmed) return;

  if (!shellOk) {
    await page.goto(appPath(trimmed), { waitUntil: "domcontentloaded" });
    assertSignedIn(page);
    await dismissOnboardingIfPresent(page);
    await waitForLoadingToClear(page);
    return;
  }

  const sidebar = SIDEBAR_ROUTES[trimmed];
  if (sidebar) {
    const link = page.getByRole("link", { name: sidebar });
    if (await link.isVisible({ timeout: 15_000 }).catch(() => false)) {
      await link.click();
      assertSignedIn(page);
      await dismissOnboardingIfPresent(page);
      await waitForLoadingToClear(page);
      return;
    }
  }

  await clientNavigate(page, trimmed);
  assertSignedIn(page);
  await dismissOnboardingIfPresent(page);
  await waitForLoadingToClear(page);
}

function assertSignedIn(page: Page): void {
  if (isClerkHostedSignIn(page.url())) {
    throw sessionExpiredError();
  }
}

export function isClerkHostedSignIn(url: string): boolean {
  return /accounts\.shunyalabs\.ai\/sign-in/i.test(url);
}

export function isClerkHostedSignUp(url: string): boolean {
  return /accounts\.shunyalabs\.ai\/sign-up/i.test(url);
}

/** Clerk hosted sign-in (passes Cloudflare, matches production UX). */
export async function gotoSignIn(page: Page): Promise<void> {
  await page.goto(
    `${CLERK_ACCOUNTS}/sign-in?redirect_url=${redirectUrl()}`,
    { waitUntil: "domcontentloaded" },
  );
  await page
    .getByRole("heading", { name: /Sign in to Shunya Labs/i })
    .waitFor({ timeout: 60_000 });
}

/** Clerk hosted sign-up — new user journey entry point. */
export async function gotoSignUp(page: Page): Promise<void> {
  await page.goto(
    `${CLERK_ACCOUNTS}/sign-up?redirect_url=${redirectUrl()}`,
    { waitUntil: "domcontentloaded" },
  );
  await page
    .getByRole("heading", { name: /Create your account/i })
    .waitFor({ timeout: 60_000 });
}

export async function gotoSignUpFromSignIn(page: Page): Promise<void> {
  await gotoSignIn(page);
  await page.getByRole("link", { name: /^Sign up$/i }).click();
  await page
    .getByRole("heading", { name: /Create your account/i })
    .waitFor({ timeout: 30_000 });
}

export async function gotoSignInFromSignUp(page: Page): Promise<void> {
  await gotoSignUp(page);
  await page.getByRole("link", { name: /^Sign in$/i }).click();
  await page
    .getByRole("heading", { name: /Sign in to Shunya Labs/i })
    .waitFor({ timeout: 30_000 });
}
