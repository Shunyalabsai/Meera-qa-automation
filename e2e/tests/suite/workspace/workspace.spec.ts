import { test, expect } from "@playwright/test";
import { gotoApp } from "../../../helpers/navigate";
import { skipEnvPrecondition } from "../../../helpers/skip";

test.describe("Workspace & Account @smoke", () => {
  test("Personal workspace message visible in sidebar", async ({ page }) => {
    await gotoApp(page, "agents");
    await expect(
      page.getByText(/personal workspace|Select a Clerk org/i),
    ).toBeVisible({ timeout: 30_000 });
  });

  test("Organization switcher is present", async ({ page }, testInfo) => {
    await gotoApp(page, "agents");
    await expect(page.getByRole("heading", { name: /^Agents$/i })).toBeVisible({
      timeout: 30_000,
    });

    const orgSwitcher = page.locator(
      ".cl-organizationSwitcherTrigger, .cl-organizationSwitcher",
    );
    if (await orgSwitcher.isVisible({ timeout: 10_000 }).catch(() => false)) {
      return;
    }

    const personalWorkspace = page.getByText(
      /personal workspace|Select a Clerk org/i,
    );
    if (
      await personalWorkspace.isVisible({ timeout: 15_000 }).catch(() => false)
    ) {
      skipEnvPrecondition(
        testInfo,
        "Personal workspace — org switcher hidden until user joins an organization",
      );
      return;
    }

    await expect(orgSwitcher).toBeVisible({ timeout: 5_000 });
  });

  test("User profile button is present", async ({ page }) => {
    await gotoApp(page, "agents");
    await expect(
      page.locator(".cl-userButtonTrigger, .cl-userButtonBox").first(),
    ).toBeVisible({ timeout: 30_000 });
  });
});
