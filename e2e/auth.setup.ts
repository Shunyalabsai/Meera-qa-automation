import { test as setup, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { isClerkHostedSignIn } from "./helpers/navigate";
import {
  initAppSession,
  isSignedInApp,
  sessionExpiredError,
  waitForAppReady,
} from "./helpers/session-wait";

const authFile = path.join(__dirname, "../.auth/user.json");

setup("validate saved Google SSO session", async ({ page }) => {
  if (!fs.existsSync(authFile)) {
    setup.skip(true, "No .auth/user.json — run npm run auth:save first");
    return;
  }

  await initAppSession(page);

  if (isClerkHostedSignIn(page.url()) || !(await isSignedInApp(page))) {
    throw sessionExpiredError();
  }

  await waitForAppReady(page);
  await expect(page.getByRole("link", { name: "Agents" })).toBeVisible();
  expect(await isSignedInApp(page)).toBeTruthy();
});
