import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";

dotenv.config({ path: path.resolve(__dirname, ".env") });

const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ?? "https://meera-stage.shunyalabs.ai/vap/";

const authFile = path.join(__dirname, ".auth/user.json");
const hasAuthFile = fs.existsSync(authFile);
const useSavedAuth = process.env.E2E_USE_SAVED_AUTH === "true" && hasAuthFile;
const catalogOnly = process.env.E2E_CATALOG === "true";

export default defineConfig({
  testDir: "./e2e",
  testMatch: catalogOnly
    ? "**/catalog.spec.ts"
    : "**/tests/suite/**/*.spec.ts",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ["html", { open: "never" }],
    ["list"],
    ["json", { outputFile: "test-results/results.json" }],
    ["./e2e/reporters/sheet-results.reporter.ts"],
  ],
  timeout: 90_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
  },
  projects: [
    {
      name: "auth-save",
      testMatch: /auth\.save\.setup\.ts/,
      timeout: 300_000,
      use: {
        ...devices["Desktop Chrome"],
        headless: false,
      },
    },
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        ...(hasAuthFile ? { storageState: authFile } : {}),
      },
    },
    {
      name: "unsigned",
      testMatch: /authentication\/(sign-in|sign-up)\/.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], storageState: { cookies: [], origins: [] } },
    },
    {
      name: "chromium",
      testMatch: /tests\/suite\/.*\.spec\.ts/,
      testIgnore: [
        /authentication\/(sign-in|sign-up)\//,
        /authentication\/logout\//,
        /catalog\.spec\.ts/,
      ],
      dependencies: useSavedAuth ? ["setup"] : [],
      use: {
        ...devices["Desktop Chrome"],
        ...(useSavedAuth ? { storageState: authFile } : {}),
      },
    },
  ],
});
