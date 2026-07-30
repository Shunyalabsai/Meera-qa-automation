import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "https://agents.shunyalabs.ai/vap/";
const authFile = path.join(process.cwd(), ".auth/user.json");
const routes = ["billing", "admin/webhooks", "alerts"];

async function dumpCTAs(page, route) {
  await page.goto(new URL(route, baseURL).href, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  const items = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll("button, a[href], [role='tab'], input[type='submit']")) {
      const text = (el.textContent || el.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ");
      if (!text || text.length > 80) continue;
      out.push({
        tag: el.tagName,
        role: el.getAttribute("role"),
        text,
        href: el.getAttribute("href"),
      });
    }
    return out;
  });
  return { route, items };
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  storageState: fs.existsSync(authFile) ? authFile : undefined,
});
const page = await context.newPage();
for (const route of routes) {
  const data = await dumpCTAs(page, route);
  console.log(JSON.stringify(data, null, 2));
}
await browser.close();
