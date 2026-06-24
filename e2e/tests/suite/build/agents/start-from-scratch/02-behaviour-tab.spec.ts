import { test, expect } from "@playwright/test";
import { openStartFromScratchAgentForm } from "../../../../../helpers/agent.helper";
import { AgentFormPage } from "../../../../../pages/agent-form.page";
import { START_FROM_SCRATCH } from "../../../../../data/start-from-scratch-template";

test.describe("BUILD › Agents › Start from scratch — Behaviour tab @journey @start-from-scratch", () => {
  test.beforeEach(async ({ page }) => {
    const form = await openStartFromScratchAgentForm(page);
    await form.openTab("Behaviour");
  });

  test("TC-AG-SFS-020 @high @ui — Behaviour tab shows call-handling sections", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.expectBehaviourTabContent();
  });

  test("TC-AG-SFS-021 @high @positive — First message is empty until user fills it", async ({
    page,
  }) => {
    const firstMessage = page.getByLabel(/First message/i);
    await expect(firstMessage).toBeVisible();
    expect((await firstMessage.inputValue()).trim()).toBe("");
    await firstMessage.fill(START_FROM_SCRATCH.sampleFirstMessage);
    await expect(firstMessage).toHaveValue(START_FROM_SCRATCH.sampleFirstMessage);
  });

  test("TC-AG-SFS-022 @medium @ui — Speech speed slider defaults near 1.0", async ({
    page,
  }) => {
    const slider = page.locator('input[type="range"]').first();
    await expect(slider).toBeVisible();
    await expect(slider).toHaveValue(START_FROM_SCRATCH.defaultSpeechSpeed);
  });

  test("TC-AG-SFS-023 @medium @positive — Silence timeout defaults to 10 seconds", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await expect(form.numberInputByLabel(/Silence timeout/i)).toHaveValue("10");
    await form.numberInputByLabel(/Silence timeout/i).fill("8");
    await expect(form.numberInputByLabel(/Silence timeout/i)).toHaveValue("8");
  });

  test("TC-AG-SFS-024 @medium @positive — Max retries defaults to 2", async ({
    page,
  }) => {
    await page
      .getByLabel(/Re-prompt message/i)
      .fill("Are you still there?");
    await expect(page.getByRole("spinbutton", { name: /Max retries/i })).toHaveValue("2");
    await page
      .getByRole("textbox", { name: /^Closing line/i })
      .fill("It looks like you stepped away. Feel free to call back anytime.");
  });

  test("TC-AG-SFS-025 @medium @positive — Max call duration 1800 and barge-in toggles", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await expect(form.numberInputByLabel(/Max call duration/i)).toHaveValue("1800");
    const cb = form.checkboxByLabel(/barge-in/i);
    await cb.check();
    await expect(cb).toBeChecked();
  });

  test("TC-AG-SFS-026 @medium @positive — Fast farewell and goodbye message optional", async ({
    page,
  }) => {
    const goodbye = page.getByLabel(/Goodbye message/i).first();
    if (await goodbye.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await goodbye.fill("Thank you for your time. Have a great day!");
      await expect(goodbye).toHaveValue(/Thank you/i);
    }
    const fastFarewell = page.getByRole("checkbox", { name: /Fast farewell/i });
    if (await fastFarewell.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await fastFarewell.check();
      await expect(fastFarewell).toBeChecked();
    }
  });

  test("TC-AG-SFS-027 @medium @positive — Voicemail detection can be enabled", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.checkboxByLabel(/Detect voicemail/i).check();
    await expect(page.getByLabel(/Voicemail message/i)).toBeVisible();
    await page
      .getByLabel(/Voicemail message/i)
      .fill("Please call us back when you have a moment.");
  });
});
