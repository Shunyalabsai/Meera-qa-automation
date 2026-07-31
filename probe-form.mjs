import { chromium } from "@playwright/test";
import fs from "node:fs";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "https://agents.shunyalabs.ai/vap/";
const state = JSON.parse(fs.readFileSync("/Users/unitedwecare/Meera_repo/.auth/user.json", "utf8"));
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ storageState: state });
page.setDefaultTimeout(30_000);

try {
  // Open a template form directly: Credit Card Payment Reminder
  await page.goto(BASE + "agents/new", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  await page.getByRole("button", { name: /BFSI/i }).first().click();
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: /Credit Card Payment Reminder Agent/i }).first().click();
  await page.waitForTimeout(3000);

  // Check if Language is a native select
  const langSelect = await page.locator("select").count();
  console.log("native <select> count:", langSelect);

  const selects = await page.locator("select").evaluateAll((els) =>
    els.map((el) => {
      const label = el.closest("label")?.textContent?.trim().slice(0, 60);
      const id = el.id;
      const opts = Array.from(el.options).map((o) => o.value);
      return { id, label, opts };
    })
  );
  console.log("SELECTS:\n" + JSON.stringify(selects, null, 2));

  // Check Call direction radios
  const radioCount = await page.locator('input[type="radio"]').count();
  console.log("radio count:", radioCount);
  const radios = await page.locator('input[type="radio"]').evaluateAll((els) =>
    els.map((el) => {
      const label = el.closest("label")?.textContent?.trim().slice(0, 40);
      const name = el.getAttribute("name");
      const checked = el.checked;
      return { name, checked, label };
    })
  );
  console.log("RADIOS:\n" + JSON.stringify(radios, null, 2));

  // Check what "Call direction" looks like
  const callDir = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll("*")).find((e) => e.textContent?.trim() === "Call direction");
    if (!el) return "NOT FOUND";
    const p = el.parentElement;
    return p ? p.outerHTML.slice(0, 600) : "NO PARENT";
  });
  console.log("\nCALL DIRECTION HTML:\n" + callDir);

  // Check the New Agent header + Change template link
  const header = await page.getByRole("heading", { name: /New agent/i }).isVisible().catch(() => false);
  console.log("\n'New agent' heading visible:", header);
  const changeTpl = await page.getByRole("button", { name: /Change template/i }).isVisible().catch(() => false);
  console.log("'Change template' button visible:", changeTpl);

  // Pipeline section
  const shunyaNative = await page.getByText(/Shunya Native/i).first().isVisible().catch(() => false);
  console.log("'Shunya Native' visible:", shunyaNative);
  const pipelineDesc = await page.getByText(/Shunya's end-to-end voice model/i).first().isVisible().catch(() => false);
  console.log("'Shunya's end-to-end voice model' visible:", pipelineDesc);

  // System prompt bind area
  const noActiveTemplates = await page.getByText(/No active templates/i).first().isVisible().catch(() => false);
  console.log("'No active templates' visible:", noActiveTemplates);

  // Tabs
  for (const t of ["Prompt", "Behaviour", "Recording", "Outcomes", "Advanced"]) {
    console.log(`tab ${t}:`, await page.getByRole("tab", { name: t }).isVisible().catch(() => false));
  }
} catch (err) {
  console.error("PROBE ERROR:", err.message);
}
await browser.close();
