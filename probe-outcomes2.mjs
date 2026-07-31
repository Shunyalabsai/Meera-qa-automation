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
    await page.getByRole("tab", { name: "Outcomes" }).click();
    await page.waitForTimeout(1000);

    // Outcome label inputs (text inputs)
    const labels = await page.locator('input[type="text"]').evaluateAll((els) =>
      els.map((el) => el.value).filter((v) => v.trim())
    );
    console.log(`${label} outcome label inputs:`, JSON.stringify(labels));

    // Extraction textarea (mono font)
    const extraction = await page.locator('textarea[class*="font-mono"], textarea.font-mono').last()
      .inputValue().catch(() => "(none)");
    console.log(`${label} extraction:`, JSON.stringify(extraction.slice(0, 500)));

    // Escalation checkbox
    const escalation = await page.locator('input[type="checkbox"]').evaluateAll((els) =>
      els.map((el) => ({ checked: el.checked, label: (el.closest("label")?.textContent || "").trim().slice(0, 60) }))
    );
    console.log(`${label} outcomes checkboxes:`, JSON.stringify(escalation));
  }
} catch (err) {
  console.error("PROBE ERROR:", err.message);
}
await browser.close();
