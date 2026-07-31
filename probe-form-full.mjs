import { chromium } from "@playwright/test";
import fs from "node:fs";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "https://agents.shunyalabs.ai/vap/";
const state = JSON.parse(fs.readFileSync("/Users/unitedwecare/Meera_repo/.auth/user.json", "utf8"));
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ storageState: state });
page.setDefaultTimeout(30_000);

// Open a template form
await page.goto(BASE + "agents/new", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(2000);
await page.getByRole("button", { name: /BFSI/i }).first().click();
await page.getByRole("button", { name: /← Back to industries/i }).waitFor({ state: "visible", timeout: 10000 });
await page.getByRole("button", { name: /^Credit Card Payment Reminder Agent/i }).first().click();
await page.getByRole("tab", { name: "Prompt" }).waitFor({ state: "visible", timeout: 10000 });

const TABS = ["Prompt", "Behaviour", "Recording", "Outcomes", "Advanced"];
for (const tab of TABS) {
  await page.getByRole("tab", { name: tab }).click();
  await page.waitForTimeout(600);
  const labels = await page.locator("main label, main fieldset legend").evaluateAll((els) =>
    els.map((e) => e.textContent?.trim()).filter(Boolean).slice(0, 30)
  );
  const inputs = await page.locator("main input, main select, main textarea").evaluateAll((els) =>
    els.map((e) => {
      const t = e.tagName.toLowerCase();
      return `${t}#${e.id}::${(e.getAttribute("placeholder") || e.getAttribute("name") || e.textContent?.trim() || "").slice(0, 30)}`;
    }).slice(0, 30)
  );
  const buttons = await page.locator("main button").evaluateAll((els) =>
    els.map((e) => e.textContent?.trim().slice(0, 35)).filter(Boolean).slice(0, 15)
  );
  console.log(`\n===== TAB: ${tab} =====`);
  console.log("LABELS:", JSON.stringify([...new Set(labels)]));
  console.log("INPUTS:", JSON.stringify(inputs));
  console.log("BUTTONS:", JSON.stringify([...new Set(buttons)]));
}
await browser.close();
