import { test, expect } from "@playwright/test";
import { gotoApp } from "../../../helpers/navigate";

test.describe("Global UI › Responsive @smoke", () => {
  test("TC-UI-001 @high @positive — Mobile viewport (375px) on Agents", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await gotoApp(page, "agents");
    await expect(page).toHaveURL(/\/agents/);
    // Mobile layout keeps sidebar open — main h1 can be off-screen; assert usable shell.
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("link", { name: /New agent/i })).toBeVisible();
    await expect(
      page.getByRole("navigation").getByRole("link", { name: /^Agents$/i }),
    ).toBeVisible();
  });
});
