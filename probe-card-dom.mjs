import { chromium } from "@playwright/test";
import fs from "node:fs";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "https://agents.shunyalabs.ai/vap/";
const state = JSON.parse(fs.readFileSync("/Users/unitedwecare/Meera_repo/.auth/user.json", "utf8"));
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ storageState: state });
page.setDefaultTimeout(30_000);

try {
  await page.goto(BASE + "agents/new", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  await page.getByRole("button", { name: /^BFSI /i }).first().click();
  await page.waitForTimeout(1200);

  const card = page.getByRole("button", { name: /^Fixed Deposit Payment Agent \(Hindi\)/i }).first();
  const html = await card.evaluate((el) => el.outerHTML);
  console.log("CARD HTML:\n" + html.slice(0, 1500));

  // Try getByText within card
  const byText = await card.getByText("Hindi").count();
  console.log("\ncard.getByText('Hindi') count:", byText);
} catch (err) {
  console.error("PROBE ERROR:", err.message);
}
await browser.close();
