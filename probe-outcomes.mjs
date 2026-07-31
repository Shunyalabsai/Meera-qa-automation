import { chromium } from "@playwright/test";
import fs from "node:fs";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "https://agents.shunyalabs.ai/vap/";
const state = JSON.parse(fs.readFileSync("/Users/unitedwecare/Meera_repo/.auth/user.json", "utf8"));
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ storageState: state });
page.setDefaultTimeout(30_000);

const TEMPLATES = [
  ["BFSI", /Credit Card Payment Reminder Agent/i, "credit-card"],
  ["Logistics", /Order Confirmation & Reschedule Agent/i, "order-confirmation"],
  ["Healthcare", /Appointment Reminder & Reschedule Agent/i, "appointment"],
  ["Telecom", /Retention Call Agent/i, "retention"],
];

async function openTemplate(industry, agentName) {
  await page.goto(BASE + "agents/new", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  await page.getByRole("button", { name: new RegExp(industry, "i") }).first().click();
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: agentName }).first().click();
  await page.waitForTimeout(3000);
}

try {
  for (const [industry, agentPattern, label] of TEMPLATES) {
    await openTemplate(industry, agentPattern);
    console.log(`\n===== ${label} | ${industry} =====`);

    // Outcomes tab
    await page.getByRole("tab", { name: "Outcomes" }).click();
    await page.waitForTimeout(1000);
    const outcomes = await page.evaluate(() => {
      const main = document.querySelector("main") || document.body;
      return main.innerText.slice(0, 1500);
    });
    console.log("OUTCOMES TEXT:\n" + outcomes);

    // Recording tab
    await page.getByRole("tab", { name: "Recording" }).click();
    await page.waitForTimeout(1000);
    const rec = await page.evaluate(() => {
      const main = document.querySelector("main") || document.body;
      return main.innerText.slice(0, 700);
    });
    console.log("\nRECORDING TEXT:\n" + rec);

    // Advanced tab
    await page.getByRole("tab", { name: "Advanced" }).click();
    await page.waitForTimeout(1000);
    const adv = await page.evaluate(() => {
      const main = document.querySelector("main") || document.body;
      return main.innerText.slice(0, 700);
    });
    console.log("\nADVANCED TEXT:\n" + adv);
  }
} catch (err) {
  console.error("PROBE ERROR:", err.message);
}
await browser.close();
