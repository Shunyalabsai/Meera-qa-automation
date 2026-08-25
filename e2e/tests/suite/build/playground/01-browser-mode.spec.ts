import { test, expect } from "@playwright/test";
import { openPlayground } from "../../../../helpers/playground.helper";
import { PlaygroundPage } from "../../../../pages/playground.page";

test.describe("BUILD › Playground — Browser mode @journey @new-user @playground @positive", () => {
  test.beforeEach(async ({ page }) => {
    await openPlayground(page);
  });

  test("TC-PG-010 @high @positive — Browser mode selected by default", async ({
    page,
  }) => {
    const playground = new PlaygroundPage(page);
    await playground.expectBrowserModePanel();
    await expect(
      page.getByText(/Mic streams PCM 16 kHz|bot audio plays back at 24 kHz/i).first(),
    ).toBeVisible();
  });

  test("TC-PG-011 @high @positive — Start call button visible in browser mode", async ({
    page,
  }) => {
    const playground = new PlaygroundPage(page);
    await expect(playground.startBrowserCallButton()).toBeVisible();
  });

  test("TC-PG-012 @high @positive — Agent dropdown lists available agents", async ({
    page,
  }) => {
    const playground = new PlaygroundPage(page);
    const select = playground.agentSelect();
    await expect(select).toBeVisible();
  });

  test("TC-PG-013 @medium @positive — Select agent from dropdown", async ({
    page,
  }) => {
    const playground = new PlaygroundPage(page);
    test.skip(
      !(await playground.hasSelectableAgent()),
      "No agents available — create an agent first",
    );
    const agentId = await playground.selectFirstAgent();
    expect(agentId).toBeTruthy();
  });

  test("TC-PG-014 @medium @positive — Switch Phone → Browser restores browser panel", async ({
    page,
  }) => {
    const playground = new PlaygroundPage(page);
    await playground.switchToPhoneMode();
    await playground.switchToBrowserMode();
    await playground.expectBrowserModePanel();
  });

});
