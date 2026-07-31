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
  for (const industry of ["BFSI", "Ecommerce", "Healthcare", "Logistics", "Telecom"]) {
    await page.getByRole("button", { name: new RegExp(`^${industry} `, "i") }).first().click();
    await page.waitForTimeout(1200);
    // Count buttons inside main
    const mainButtons = await page.locator("main button").evaluateAll((els) =>
      els.map((el) => (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60))
    );
    console.log(`\n=== ${industry} main buttons (${mainButtons.length}) ===`);
    console.log(JSON.stringify(mainButtons, null, 1));
    // go back
    await page.getByRole("button", { name: /← Back to industries/i }).click();
    await page.waitForTimeout(800);
  }
} catch (err) {
  console.error("PROBE ERROR:", err.message);
}
await browser.close();
