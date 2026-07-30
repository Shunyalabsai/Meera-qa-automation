import { test, expect } from "@playwright/test";
import { openPlayground } from "../../../../../helpers/playground.helper";
import { skipUnlessHasSelectableAgent } from "../../../../../helpers/existing-user.helper";

test.describe("BUILD › Playground — Browser mode @journey @existing-user @playground @positive", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await skipUnlessHasSelectableAgent(page, testInfo);
  });

  test("TC-PG-EU-010 @high @positive — Browser mode panel visible by default", async ({
    page,
  }) => {
    const playground = await openPlayground(page);
    await playground.expectBrowserModePanel();
  });

  test("TC-PG-EU-011 @high @positive — Select agent enables Start call button", async ({
    page,
  }) => {
    const playground = await openPlayground(page);
    await playground.selectFirstAgent();
    await expect(playground.startBrowserCallButton()).toBeVisible();
  });

  test("TC-PG-EU-012 @medium @positive — Switch to Phone mode and back", async ({
    page,
  }) => {
    const playground = await openPlayground(page);
    await playground.switchToPhoneMode();
    await playground.switchToBrowserMode();
    await playground.expectBrowserModePanel();
  });
});
