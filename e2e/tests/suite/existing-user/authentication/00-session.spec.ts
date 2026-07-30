import { test, expect } from "@playwright/test";
import { gotoApp } from "../../../../helpers/navigate";

test.describe("Authentication — Returning user session @journey @existing-user @auth @positive", () => {
  test("TC-AU-EU-001 @high @positive — Saved session opens Agents dashboard", async ({
    page,
  }) => {
    await gotoApp(page, "agents");
    await expect(page.getByRole("heading", { name: /Agents/i })).toBeVisible({
      timeout: 30_000,
    });
  });

  test("TC-AU-EU-002 @medium @positive — Session persists across BUILD sections", async ({
    page,
  }) => {
    await gotoApp(page, "agents");
    await page.getByRole("link", { name: /^Playground$/i }).click();
    await expect(page).toHaveURL(/playground/, { timeout: 30_000 });
    await page.getByRole("link", { name: /^Prompts$/i }).click();
    await expect(page).toHaveURL(/prompts/, { timeout: 30_000 });
  });

  test("TC-AU-EU-003 @medium @positive — Session persists across ANALYZE sections", async ({
    page,
  }) => {
    await gotoApp(page, "calls");
    await page.getByRole("link", { name: /^Insights$/i }).click();
    await expect(page).toHaveURL(/insights/, { timeout: 30_000 });
    await page.getByRole("link", { name: /^Billing$/i }).click();
    await expect(page).toHaveURL(/billing/, { timeout: 30_000 });
  });
});
