import { test, expect } from "@playwright/test";
import { openPlayground } from "../../../../../helpers/playground.helper";
import { skipUnlessHasSelectableAgent } from "../../../../../helpers/existing-user.helper";

test.describe("BUILD › Playground — Phone mode @journey @existing-user @playground @positive", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await skipUnlessHasSelectableAgent(page, testInfo);
  });

  test("TC-PG-EU-020 @high @positive — Phone mode panel shows from/to/context fields", async ({
    page,
  }) => {
    const playground = await openPlayground(page);
    await playground.selectFirstAgent();
    await playground.switchToPhoneMode();
    await playground.expectPhoneModePanel();
  });

  test("TC-PG-EU-021 @medium @positive — To number field accepts input", async ({
    page,
  }) => {
    const playground = await openPlayground(page);
    await playground.selectFirstAgent();
    await playground.switchToPhoneMode();
    await playground.fillToNumber("+919876543210");
    await expect(playground.toNumberInput()).toHaveValue("+919876543210");
  });

  test("TC-PG-EU-022 @medium @positive — Start Phone Call button visible", async ({
    page,
  }) => {
    const playground = await openPlayground(page);
    await playground.selectFirstAgent();
    await playground.switchToPhoneMode();
    await expect(playground.startPhoneCallButton()).toBeVisible();
  });
});
