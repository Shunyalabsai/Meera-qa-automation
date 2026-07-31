import { chromium } from "@playwright/test";
import fs from "node:fs";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "https://agents.shunyalabs.ai/vap/";
const state = JSON.parse(fs.readFileSync("/Users/unitedwecare/Meera_repo/.auth/user.json", "utf8"));
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ storageState: state });
page.setDefaultTimeout(30_000);

async function dumpRole(label, locator) {
  try {
    const info = await locator.evaluate((el) => {
      const tag = el.tagName;
      const role = el.getAttribute("role");
      const text = (el.innerText || "").trim().replace(/\s+/g, " ").slice(0, 80);
      const href = el.getAttribute("href");
      const cls = (el.className || "").toString().slice(0, 100);
      return { tag, role, text, href, cls };
    });
    console.log(`${label}: ${JSON.stringify(info)}`);
  } catch (e) {
    console.log(`${label}: NOT FOUND (${e.message.split("\n")[0]})`);
  }
}

try {
  // Agents list page
  await page.goto(BASE + "agents", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  await dumpRole("new-agent", page.getByText("New agent", { exact: true }).first());
  await dumpRole("new-agent-by-role-link", page.getByRole("link", { name: /New agent/i }).first());
  await dumpRole("new-agent-by-role-btn", page.getByRole("button", { name: /New agent/i }).first());

  // Agent card actions
  const card = page.locator("li").filter({ has: page.locator("span.font-medium") }).first();
  await dumpRole("card-edit", card.getByText("Edit", { exact: true }).first());
  await dumpRole("card-clone", card.getByText("Clone", { exact: true }).first());
  await dumpRole("card-delete", card.getByText("Delete", { exact: true }).first());
  await dumpRole("card-test", card.getByText("Test", { exact: true }).first());
  await dumpRole("agent-name-span", card.locator("span.font-medium").first());
  await dumpRole("card-subtitle", card.locator("p").first());
  const cardHTML = await card.evaluate((el) => el.outerHTML.slice(0, 900));
  console.log("\nCARD HTML:\n" + cardHTML);

  // Gallery: start from scratch + schedule consultation element types
  await page.goto(BASE + "agents/new", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  await dumpRole("schedule-consult", page.getByText("Schedule a consultation", { exact: false }).first());
  await dumpRole("start-from-scratch", page.getByText("Start from scratch", { exact: false }).first());
  const sfsBtn = page.getByRole("button", { name: /Start from scratch/i });
  await dumpRole("start-from-scratch-role-btn", sfsBtn.first());

  // Industry card DOM
  await dumpRole("industry-bfsi", page.getByText("BFSI", { exact: true }).first());
  const industryCardHTML = await page.getByRole("button", { name: /BFSI/i }).first().evaluate((el) => el.outerHTML.slice(0, 800));
  console.log("\nBFSI CARD HTML:\n" + industryCardHTML);
} catch (err) {
  console.error("PROBE ERROR:", err.message);
}
await browser.close();
