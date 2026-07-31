import { chromium } from "@playwright/test";
import fs from "node:fs";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "https://agents.shunyalabs.ai/vap/";
const authFile = "/Users/unitedwecare/Meera_repo/.auth/user.json";
const state = JSON.parse(fs.readFileSync(authFile, "utf8"));

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ storageState: state });
page.setDefaultTimeout(30_000);

// Dump text helper
async function dumpText(label) {
  const text = await page.evaluate(() => document.body.innerText);
  console.log(`\n========== ${label} ==========`);
  console.log(text);
}

try {
  await page.goto(BASE + "agents/new", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(4000);
  await dumpText("GALLERY (agents/new)");

  // Capture buttons/links with roles for structure
  const buttons = await page.evaluate(() =>
    Array.from(document.querySelectorAll("button, a, [role=button], [role=tab], [role=link]"))
      .map((el) => el.innerText.trim().replace(/\s+/g, " "))
      .filter((t) => t.length > 0 && t.length < 120)
  );
  console.log(`\n========== ALL CLICKABLE ELEMENTS ==========`);
  console.log(JSON.stringify(buttons, null, 2));

  // Try clicking each industry and dump agent cards
  const industries = ["BFSI", "Ecommerce", "Healthcare", "Logistics", "Telecom"];
  for (const industry of industries) {
    const btn = page.getByRole("button", { name: new RegExp(industry, "i") }).first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(1500);
      await dumpText(`AFTER CLICKING INDUSTRY: ${industry}`);
      // Try going back
      const backBtn = page.getByRole("button", { name: /← Back to industries/i });
      if (await backBtn.isVisible().catch(() => false)) {
        await backBtn.click();
        await page.waitForTimeout(1000);
      } else {
        // fallback: navigate back to gallery
        await page.goto(BASE + "agents/new", { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(2500);
      }
    } else {
      console.log(`\n[!] Industry button not visible: ${industry}`);
    }
  }
} catch (err) {
  console.error("PROBE ERROR:", err.message);
}

await browser.close();
