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
  await page.waitForTimeout(2500);
  await page.getByRole("button", { name: new RegExp(industry, "i") }).first().click();
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: agentName }).first().click();
  await page.waitForTimeout(3000);
}

try {
  for (const [industry, agentPattern] of TEMPLATES) {
    await openTemplate(industry, agentPattern);
    const vals = await page.locator("select").evaluateAll((els) =>
      els.map((el) => {
        const label = el.closest("label")?.textContent?.trim().split("\n")[0].trim();
        const opts = Array.from(el.options);
        const selected = opts.find((o) => o.selected)?.value;
        return { label: label?.slice(0, 30), selected, count: opts.length };
      })
    );
    // Name field value
    const name = await page.getByRole("textbox", { name: /^Name/i }).inputValue().catch(() => "(none)");
    // Instructions length
    const instr = await page.getByRole("textbox", { name: /^Instructions/i }).inputValue().catch(() => "");
    // First message (Behaviour tab)
    await page.getByRole("tab", { name: "Behaviour" }).click();
    await page.waitForTimeout(800);
    const firstMsg = await page.getByLabel(/First message/i).inputValue().catch(() => "(none)");
    const silence = await page.locator('input[type="number"]').evaluateAll((els) =>
      els.map((el) => {
        const label = el.closest("label")?.textContent?.trim().split("\n")[0].trim();
        return { label: label?.slice(0, 30), value: el.value };
      })
    );
    console.log(`\n=== ${industry} / ${agentPattern} ===`);
    console.log("name:", name);
    console.log("instructions len:", instr.length);
    console.log("first message:", firstMsg.slice(0, 90));
    console.log("selects:", JSON.stringify(vals.filter(v => v.label), null, 1));
    console.log("behaviour numbers:", JSON.stringify(silence));
  }
} catch (err) {
  console.error("PROBE ERROR:", err.message);
}
await browser.close();
