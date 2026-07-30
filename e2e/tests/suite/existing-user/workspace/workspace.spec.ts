import { test, expect } from "@playwright/test";
import { gotoApp } from "../../../../helpers/navigate";

test.describe("Workspace — Returning user @journey @existing-user @workspace @ui", () => {
  test("TC-WS-EU-001 @medium @ui — Personal workspace message visible", async ({
    page,
  }) => {
    await gotoApp(page, "agents");
    await expect(
      page.getByText(/personal workspace|Clerk org/i).first(),
    ).toBeVisible({ timeout: 15_000 });
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
