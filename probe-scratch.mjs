import { chromium } from "@playwright/test";
import fs from "node:fs";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "https://agents.shunyalabs.ai/vap/";
const state = JSON.parse(fs.readFileSync("/Users/unitedwecare/Meera_repo/.auth/user.json", "utf8"));
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ storageState: state });
page.setDefaultTimeout(30_000);

try {
  await page.goto(BASE + "agents/new", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  await page.getByRole("button", { name: /Start from scratch/i }).first().click();
  await page.waitForTimeout(2500);

  // Prompt tab dropdowns
  const selects = await page.locator("select").evaluateAll((els) =>
    els.map((el) => {
      const selected = Array.from(el.options).find((o) => o.selected)?.value;
      const labelText = document.querySelector(`label[for="${el.id}"]`)?.textContent?.trim().split("\n")[0] || "";
      return { id: el.id, label: labelText.slice(0, 25), selected };
    })
  );
  console.log("SELECTS:\n" + JSON.stringify(selects, null, 1));

  // Behaviour tab numbers
  await page.getByRole("tab", { name: "Behaviour" }).click();
  await page.waitForTimeout(800);
  const nums = await page.locator('input[type="number"]').evaluateAll((els) =>
    els.map((el) => {
      const labelText = document.querySelector(`label[for="${el.id}"]`)?.textContent?.trim().split("\n")[0] || "";
      return { label: labelText.slice(0, 30), value: el.value };
    })
  );
  console.log("BEHAVIOUR NUMBERS:\n" + JSON.stringify(nums, null, 1));

  // Barge-in / fast farewell checkbox states
  const checks = await page.locator('input[type="checkbox"]').evaluateAll((els) =>
    els.map((el) => {
      const labelText = document.querySelector(`label[for="${el.id}"]`)?.textContent?.trim().split("\n")[0] || "";
      return { label: labelText.slice(0, 30), checked: el.checked };
    })
  );
  console.log("CHECKBOXES:\n" + JSON.stringify(checks, null, 1));
} catch (err) {
  console.error("PROBE ERROR:", err.message);
}
await browser.close();
