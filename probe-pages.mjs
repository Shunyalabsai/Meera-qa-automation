import { chromium } from "@playwright/test";
import fs from "node:fs";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "https://agents.shunyalabs.ai/vap/";
const state = JSON.parse(fs.readFileSync("/Users/unitedwecare/Meera_repo/.auth/user.json", "utf8"));
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ storageState: state });
page.setDefaultTimeout(30_000);

await page.goto(BASE, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(2500);

// Sidebar nav links
const nav = await page.locator("aside a, nav a").evaluateAll((els) =>
  els.map((e) => ({ text: e.textContent?.trim().slice(0, 30), href: e.getAttribute("href") }))
);
console.log("=== SIDEBAR LINKS ===");
console.log(JSON.stringify([...new Set(nav.map(l => l.text))], null, 0));

// Visit each route and dump main heading + buttons
const ROUTES = ["agents", "prompts", "playground", "campaigns", "phone-numbers", "live-calls", "calls", "recordings", "insights", "alerts", "billing", "admin/webhooks"];
for (const route of ROUTES) {
  try {
    await page.goto(BASE + route, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1800);
    const headings = await page.locator("main h1, main h2").evaluateAll((els) =>
      els.map((e) => e.textContent?.trim()).filter(Boolean).slice(0, 4)
    );
    const btns = await page.locator("main button").evaluateAll((els) =>
      els.map((e) => e.textContent?.trim().slice(0, 30)).filter(Boolean).slice(0, 8)
    );
    console.log(`\n[${route}] headings=${JSON.stringify(headings)}`);
    console.log(`  buttons=${JSON.stringify([...new Set(btns)].slice(0, 8))}`);
  } catch (e) {
    console.log(`\n[${route}] ERROR ${e.message.split("\n")[0]}`);
  }
}
await browser.close();
