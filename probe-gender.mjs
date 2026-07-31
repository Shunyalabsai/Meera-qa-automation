import { chromium } from "@playwright/test";
import fs from "node:fs";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "https://agents.shunyalabs.ai/vap/";
const state = JSON.parse(fs.readFileSync("/Users/unitedwecare/Meera_repo/.auth/user.json", "utf8"));
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ storageState: state });
page.setDefaultTimeout(30_000);

const TEMPLATES = [
  ["BFSI", /Credit Card Payment Reminder Agent/i],
  ["Logistics", /Order Confirmation & Reschedule Agent/i],
  ["Healthcare", /Appointment Reminder & Reschedule Agent/i],
  ["Telecom", /Retention Call Agent/i],
];

async function openTemplate(industry, agentName) {
  await page.goto(BASE + "agents/new", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  await page.getByRole("button", { name: new RegExp(industry, "i") }).first().click();
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: agentName }).first().click();
  await page.waitForTimeout(2500);
}

try {
  for (const [industry, agentPattern] of TEMPLATES) {
    await openTemplate(industry, agentPattern);
    const sel = page.locator('select#agent-gender-select, select:has(option[value="female"])').first();
    const gender = await page
      .locator("select")
      .evaluateAll((els) => {
        return els.map((el) => {
          const selected = Array.from(el.options).find((o) => o.selected)?.value;
          const labelText = document.querySelector(`label[for="${el.id}"]`)?.textContent?.trim().split("\n")[0] || "";
          return { id: el.id, label: labelText.slice(0, 25), selected };
        });
      });
    console.log(`=== ${industry} ===`);
    console.log(JSON.stringify(gender, null, 1));
  }
} catch (err) {
  console.error("PROBE ERROR:", err.message);
}
await browser.close();
