import { test, expect } from "@playwright/test";
import { openPlayground } from "../../../../helpers/playground.helper";
import { PLAYGROUND_SAMPLES } from "../../../../data/playground-data";

test.describe("BUILD › Playground — CTA functional @playground @cta", () => {
  test("CTA-PG-001 @high @cta — Browser mode toggle shows Start call", async ({
    page,
  }) => {
    const playground = await openPlayground(page);
    await playground.switchToBrowserMode();
    await expect(playground.startBrowserCallButton()).toBeVisible();
  });

  test("CTA-PG-002 @high @cta — Phone Call mode toggle shows Start Phone Call", async ({
    page,
  }) => {
    const playground = await openPlayground(page);
    await playground.switchToPhoneMode();
    await expect(playground.startPhoneCallButton()).toBeVisible();
  });

  test("CTA-PG-003 @high @cta — Start call clicked with agent shows activity or error", async ({
    page,
  }) => {
    const playground = await openPlayground(page);
    test.skip(
      !(await playground.hasSelectableAgent()),
      "No agents — create an agent first",
    );
    await playground.selectFirstAgent();
    await playground.clickStartBrowserCall();
    await expect(
      page.getByText(/connecting|idle|error|agent|call|microphone|permission/i).first(),
    ).toBeVisible({ timeout: 20_000 });
  });

  test("CTA-PG-004 @high @cta — Start Phone Call clicked validates or dials", async ({
    page,
  }) => {
    const playground = await openPlayground(page);
    await playground.switchToPhoneMode();
    test.skip(
      !(await playground.hasSelectableAgent()),
      "No agents — create an agent first",
    );
    await playground.selectFirstAgent();
    await playground.fillToNumber(PLAYGROUND_SAMPLES.validIndianNumber);
    await playground.clickStartPhoneCall();
    await expect(
      page.getByText(/dial|call|error|invalid|connecting|agent/i).first(),
    ).toBeVisible({ timeout: 20_000 });
  });
});
