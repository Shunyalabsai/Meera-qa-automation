import { test, expect } from "@playwright/test";
import { gotoApp } from "../../../../helpers/navigate";

test.describe("Workspace — Returning user @journey @existing-user @workspace @ui", () => {
  test("TC-WS-EU-001 @medium @ui — Account menu opens from user button", async ({
    page,
  }) => {
    await gotoApp(page, "agents");
    // The account/workspace controls live in the user menu — no org switcher in the sidebar.
    await page.getByRole("button", { name: /Open user menu|User menu/i }).click();
    await expect(page.getByText(/Manage account/i)).toBeVisible({
      timeout: 15_000,
    });
  });

  test("TC-WS-EU-002 @medium @ui — User profile menu button visible", async ({
    page,
  }) => {
    await gotoApp(page, "agents");
    await expect(
      page.getByRole("button", { name: /Open user menu|User menu/i }),
    ).toBeVisible({ timeout: 15_000 });
  });
});
