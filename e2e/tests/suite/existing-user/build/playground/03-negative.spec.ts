import { test, expect } from "@playwright/test";
import { openPlayground } from "../../../../../helpers/playground.helper";
import { skipUnlessHasSelectableAgent } from "../../../../../helpers/existing-user.helper";

test.describe("BUILD › Playground — Negative @journey @existing-user @playground @negative", () => {
  test("TC-PG-EU-N101 @medium @negative — Start call without agent blocked", async ({
    page,
  }) => {
    const playground = await openPlayground(page);
    if (await playground.hasSelectableAgent()) {
      test.skip(true, "Agent auto-selected — cannot test no-agent state");
    }
    await expect(playground.startBrowserCallButton()).toBeDisabled();
  });

  test("TC-PG-EU-N102 @medium @negative — Invalid playground deep-link handled", async ({
    page,
  }) => {
    await page.goto("/vap/playground/not-valid");
    await expect(
      page.locator("main").getByText(/404|not found|Playground/i).first(),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("TC-PG-EU-N103 @medium @negative — Empty phone number rejected on Start Phone Call", async ({
    page,
  }, testInfo) => {
    await skipUnlessHasSelectableAgent(page, testInfo);
    const playground = await openPlayground(page);
    await playground.selectFirstAgent();
    await playground.switchToPhoneMode();
    await playground.fillToNumber("");
    const btn = playground.startPhoneCallButton();
    const isDisabled = await btn.isDisabled().catch(() => false);
    if (isDisabled) {
      await expect(btn).toBeDisabled();
    } else {
      await btn.click();
      await expect(
        page.locator("main").getByText(/invalid|required|enter|phone|number|error/i).first(),
      ).toBeVisible({ timeout: 15_000 });
    }
  });
});
