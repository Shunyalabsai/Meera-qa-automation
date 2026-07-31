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
    // Get select values with labels from aria-label, id, or preceding sibling label
    const selects = await page.locator("select").evaluateAll((els) =>
      els.map((el) => {
        const label =
          el.getAttribute("aria-label") ||
          el.getAttribute("name") ||
          (el.id ? el.id : "");
        const opts = Array.from(el.options);
        const selected = opts.find((o) => o.selected)?.value;
        return { id: el.id, label, selected, count: opts.length };
      })
    );
    // Also dump labels associated via for= attribute
    const labels = await page.locator("label").evaluateAll((els) =>
      els.map((el) => ({ for: el.getAttribute("for"), text: el.textContent.trim().slice(0, 40) }))
    );
    const name = await page.getByRole("textbox", { name: /^Name/i }).inputValue().catch(() => "(none)");
    const instr = await page.getByRole("textbox", { name: /^Instructions/i }).inputValue().catch(() => "");
    const desc = await page.locator("textarea").nth(1).inputValue().catch(() => "(none)");

    console.log(`\n=== ${industry} | ${agentPattern} ===`);
    console.log("name:", name);
    console.log("desc:", desc);
    console.log("instr len:", instr.length);
    console.log("SELECTS:", JSON.stringify(selects));
    console.log("LABELS:", JSON.stringify(labels.filter((l) => l.for)));

    // Behaviour tab
    await page.getByRole("tab", { name: "Behaviour" }).click();
    await page.waitForTimeout(800);
    const firstMsg = await page.getByLabel(/First message/i).inputValue().catch(() => "(none)");
    console.log("first message:", JSON.stringify(firstMsg.slice(0, 120)));
    const numbs = await page.locator('input[type="number"]').evaluateAll((els) =>
      els.map((el) => ({ label: el.getAttribute("aria-label") || el.id, value: el.value }))
    );
    console.log("numbers:", JSON.stringify(numbs));
    // Checkboxes in behaviour
    const checks = await page.locator('input[type="checkbox"]').evaluateAll((els) =>
      els.map((el) => ({ label: (el.closest("label")?.textContent || "").trim().slice(0, 50) || el.getAttribute("aria-label"), checked: el.checked }))
    );
    console.log("behaviour checkboxes:", JSON.stringify(checks));
  }
} catch (err) {
  console.error("PROBE ERROR:", err.message);
}
await browser.close();
