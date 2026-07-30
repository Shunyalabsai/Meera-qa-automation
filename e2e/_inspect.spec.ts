import { test } from "@playwright/test";
import fs from "node:fs";

test("inspect prompts page", async ({ page }) => {
  test.setTimeout(60000);
  await page.goto("https://agents.shunyalabs.ai/vap/prompts", { waitUntil: "networkidle" });
  await page.waitForTimeout(5000);
  
  const headings = await page.locator("h1, h2, h3, h4").evaluateAll(
    (els: Element[]) => (els as HTMLElement[]).map((e) => e.innerText.trim()).filter(Boolean)
  );
  const mainText = await page.locator("main").first().innerText().catch(() => "N/A");
  
  const lines: string[] = [];
  lines.push("=== HEADINGS ===");
  lines.push(JSON.stringify(headings, null, 2));
  lines.push("\n=== MAIN TEXT ===");
  lines.push(mainText.substring(0, 2000));
  
  fs.writeFileSync("/tmp/prompts-page-dump.txt", lines.join("\n"));
  console.log("Dumped to /tmp/prompts-page-dump.txt");
  
  // H1 parent subtitle
  const h1 = page.locator("h1");
  const parent = h1.locator("xpath=..");
  const subtext = await parent.locator("p, span, div").filter({hasText: /./}).first().innerText().catch(() => "N/A");
  console.log("\nFirst sibling text after heading:", subtext);
});
