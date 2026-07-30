import { test, expect } from "@playwright/test";
import { openPlayground } from "../../../../../helpers/playground.helper";
import { skipUnlessHasSelectableAgent } from "../../../../../helpers/existing-user.helper";

test.describe("BUILD › Playground — CTA @journey @existing-user @playground @cta", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await skipUnlessHasSelectableAgent(page, testInfo);
  });

  test("CTA-PG-EU-001 @high @cta — Browser mode tab clickable", async ({ page }) => {
    const playground = await openPlayground(page);
    await playground.switchToBrowserMode();
    await playground.expectBrowserModePanel();
  });

  test("CTA-PG-EU-002 @high @cta — Phone mode tab clickable", async ({ page }) => {
    const playground = await openPlayground(page);
    await playground.selectFirstAgent();
    await playground.switchToPhoneMode();
    await playground.expectPhoneModePanel();
  });

  test("CTA-PG-EU-003 @medium @cta — Agent dropdown selects first agent", async ({
    page,
  }) => {
    const playground = await openPlayground(page);
    const id = await playground.selectFirstAgent();
    expect(id).toBeTruthy();
    expect(await playground.selectedAgentValue()).toBe(id);
  });
});
