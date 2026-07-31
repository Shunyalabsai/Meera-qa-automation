import { chromium } from "@playwright/test";
import fs from "node:fs";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "https://agents.shunyalabs.ai/vap/";
const state = JSON.parse(fs.readFileSync("/Users/unitedwecare/Meera_repo/.auth/user.json", "utf8"));

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ storageState: state });
page.setDefaultTimeout(30_000);

async function dumpText(label) {
  const text = await page.evaluate(() => document.body.innerText);
  console.log(`\n========== ${label} ==========`);
  console.log(text.slice(0, 4000));
}

try {
  // 1. Click a non-tested template: Fixed Deposit Payment Agent (BFSI) → dump form defaults
  await page.goto(BASE + "agents/new", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  await page.getByRole("button", { name: /BFSI/i }).first().click();
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: /Fixed Deposit Payment Agent/i }).first().click();
  await page.waitForTimeout(3000);
  await dumpText("FORM: Fixed Deposit Payment Agent (non-tested template)");

  // 2. Agents list page
  await page.goto(BASE + "agents", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  await dumpText("AGENTS LIST PAGE");

  // 3. Schedule a consultation CTA
  await page.goto(BASE + "agents/new", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  const consult = page.getByRole("button", { name: /Schedule a consultation/i });
  if (await consult.isVisible().catch(() => false)) {
    await consult.click();
    await page.waitForTimeout(2500);
    await dumpText("AFTER CLICKING SCHEDULE A CONSULTATION");
  }
} catch (err) {
  console.error("PROBE ERROR:", err.message);
}

await browser.close();
