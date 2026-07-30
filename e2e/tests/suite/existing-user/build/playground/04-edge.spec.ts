import { test, expect } from "@playwright/test";
import { openPlayground } from "../../../../../helpers/playground.helper";
import { skipUnlessHasSelectableAgent } from "../../../../../helpers/existing-user.helper";
import { reloadSpaRoute } from "../../../../../helpers/navigate";

test.describe("BUILD › Playground — Edge @journey @existing-user @playground @edge", () => {
  test("TC-PG-EU-E101 @medium @edge — Mode toggle persists after agent selection", async ({
    page,
  }, testInfo) => {
    await skipUnlessHasSelectableAgent(page, testInfo);
    const playground = await openPlayground(page);
    await playground.selectFirstAgent();
    await playground.switchToPhoneMode();
    await playground.switchToBrowserMode();
    await playground.expectBrowserModePanel();
  });

  test("TC-PG-EU-E102 @medium @edge — Navigate to Agents and back", async ({
    page,
  }) => {
    await openPlayground(page);
    await page.getByRole("link", { name: /^Agents$/i }).click();
    await expect(page).toHaveURL(/\/agents/, { timeout: 30_000 });
    await page.getByRole("link", { name: /^Playground$/i }).click();
    await expect(page).toHaveURL(/playground/, { timeout: 30_000 });
  });

  test("TC-PG-EU-E103 @low @edge — Reload keeps playground header", async ({
    page,
  }) => {
    const playground = await openPlayground(page);
    await reloadSpaRoute(page, "playground");
    await playground.expectHeader();
  });
});
