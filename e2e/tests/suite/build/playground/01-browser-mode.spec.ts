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
    await expect(playground.startBrowserCallButton()).toBeEnabled();
  });

  test("TC-PG-012 @high @positive — Agent dropdown lists available agents", async ({
    page,
  }) => {
    const playground = new PlaygroundPage(page);
    const count = await playground.agentSelect().locator("option").count();
    expect(count).toBeGreaterThanOrEqual(1);
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
    await expect(playground.agentSelect()).toHaveValue(agentId!);
  });

  test("TC-PG-014 @medium @positive — Switch Phone → Browser restores browser panel", async ({
    page,
  }) => {
    const playground = new PlaygroundPage(page);
    await playground.switchToPhoneMode();
    await playground.switchToBrowserMode();
    await playground.expectBrowserModePanel();
  });

  test("TC-VC-002 @high @positive @manual — Hindi speech during browser call", async () => {
    test.skip(true, "Manual: speak Hindi during browser call and verify transcription");
  });

  test("TC-VC-003 @high @positive @manual — Hinglish code-switch during browser call", async () => {
    test.skip(true, "Manual: speak mixed Hindi-English during browser call");
  });

  test("TC-VC-004 @high @positive @manual — TTS response in configured language", async () => {
    test.skip(true, "Manual: verify spoken response language during live call");
  });

  test("TC-VC-005 @high @positive @manual — Graceful hangup saves transcript in log", async () => {
    test.skip(true, "Manual: end browser call and verify log updates");
  });
});
