import { chromium } from "@playwright/test";
import fs from "node:fs";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "https://agents.shunyalabs.ai/vap/";
const state = JSON.parse(fs.readFileSync("/Users/unitedwecare/Meera_repo/.auth/user.json", "utf8"));
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ storageState: state });
page.setDefaultTimeout(30_000);

try {
  await page.goto(BASE + "agents", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);

  // Find the Get started section structure
  const getStarted = page.getByText(/^Get started$/i).first();
  if (await getStarted.isVisible().catch(() => false)) {
    const section = await getStarted.evaluate((el) => {
      let p = el;
      for (let i = 0; i < 6 && p; i++) p = p.parentElement;
      return p ? p.outerHTML.slice(0, 2500) : "NO PARENT";
    });
    console.log("GET STARTED SECTION HTML:\n" + section);
  }

  // Count step rows
  const stepTitles = ["Create an agent", "Test in Playground", "Add a phone number", "Run a campaign"];
  for (const t of stepTitles) {
    const count = await page.getByText(t, { exact: false }).count();
    const visible = await page.getByText(t, { exact: false }).first().isVisible().catch(() => false);
    console.log(`step "${t}": count=${count} visible=${visible}`);
  }

  // Check if Get started is always shown or tied to count
  const totalText = await page.getByText(/total/i).first().textContent().catch(() => null);
  console.log("total text:", totalText);
  console.log("has New agent link:", await page.getByRole("link", { name: /New agent/i }).isVisible().catch(() => false));

  // Check step link/button structure
  const step1 = page.getByText("Create an agent", { exact: false }).first();
  const stepHTML = await step1.evaluate((el) => {
    let p = el;
    for (let i = 0; i < 4 && p; i++) p = p.parentElement;
    return p ? p.outerHTML.slice(0, 800) : "NO PARENT";
  });
  console.log("\nSTEP 1 HTML:\n" + stepHTML);
} catch (err) {
  console.error("PROBE ERROR:", err.message);
}
await browser.close();
