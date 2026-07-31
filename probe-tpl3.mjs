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
    await page.getByRole("tab", { name: "Behaviour" }).click();
    await page.waitForTimeout(1000);
    const firstMsg = await page.getByLabel(/First message/i).inputValue().catch(() => "(none)");
    const goodbye = await page.getByLabel(/Goodbye message/i).inputValue().catch(() => "(none)");
    // numbers with labels via parent
    const numbers = await page.locator('input[type="number"]').evaluateAll((els) =>
      els.map((el) => {
        const parent = el.closest("label")?.textContent || "";
        const prev = el.parentElement?.parentElement?.querySelector("label, span, div")?.textContent || "";
        return { value: el.value, ctx: (parent + " | " + prev).replace(/\s+/g, " ").slice(0, 70) };
      })
    );
    const checks = await page.locator('input[type="checkbox"]').evaluateAll((els) =>
      els.map((el) => ({
        checked: el.checked,
        label: (el.closest("label")?.textContent || el.getAttribute("aria-label") || "").replace(/\s+/g, " ").slice(0, 70),
      }))
    );
    console.log(`\n=== ${label} ===`);
    console.log("firstMessage:", JSON.stringify(firstMsg));
    console.log("goodbye:", JSON.stringify(goodbye.slice(0, 100)));
    console.log("numbers:", JSON.stringify(numbers));
    console.log("behaviour checks:", JSON.stringify(checks));
  }
} catch (err) {
  console.error("PROBE ERROR:", err.message);
}
await browser.close();
