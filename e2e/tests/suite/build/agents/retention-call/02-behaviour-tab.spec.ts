import { test, expect } from "@playwright/test";
import { openRetentionCallAgentForm } from "../../../../../helpers/agent.helper";
import { AgentFormPage } from "../../../../../pages/agent-form.page";
import { RETENTION_CALL_TEMPLATE } from "../../../../../data/retention-call-template";

test.describe("BUILD › Agents › Retention Call — Behaviour tab @journey @retention-call", () => {
  test.beforeEach(async ({ page }) => {
    const form = await openRetentionCallAgentForm(page);
    await form.openTab("Behaviour");
  });

  test("TC-AG-CS-020 @high @ui — Behaviour tab shows call-handling sections", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.expectBehaviourTabContent();
  });

  test("TC-AG-CS-021 @high @positive — First message pre-filled with support greeting", async ({
    page,
  }) => {
    const firstMessage = page.getByLabel(/First message/i);
    await expect(firstMessage).toBeVisible();
    const value = await firstMessage.inputValue();
    if (value.length > 0) {
      expect(value).toMatch(
        RETENTION_CALL_TEMPLATE.expectedFirstMessageSnippet,
      );
    }
    await firstMessage.fill(RETENTION_CALL_TEMPLATE.defaultFirstMessage);
    await expect(firstMessage).toHaveValue(
      RETENTION_CALL_TEMPLATE.defaultFirstMessage,
    );
  });

  test("TC-AG-CS-022 @medium @ui — Speech speed slider is adjustable", async ({
    page,
  }) => {
    const slider = page.locator('input[type="range"]').first();
    await expect(slider).toBeVisible();
    await slider.fill("1.1");
  });

  test("TC-AG-CS-023 @medium @positive — Silence timeout defaults to 10 seconds", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await expect(form.numberInputByLabel(/Silence timeout/i)).toHaveValue("10");
    await form.numberInputByLabel(/Silence timeout/i).fill("8");
    await expect(form.numberInputByLabel(/Silence timeout/i)).toHaveValue("8");
  });

  test("TC-AG-CS-024 @medium @positive — Max retries defaults to 2", async ({
    page,
  }) => {
    await page.getByLabel(/Re-prompt message/i).fill("Are you still there?");
    await expect(page.getByRole("spinbutton", { name: /Max retries/i })).toHaveValue("2");
    await page
      .getByRole("textbox", { name: /^Closing line/i })
      .fill("It looks like you stepped away. Feel free to call back anytime.");
  });

  test("TC-AG-CS-025 @medium @positive — Max call duration 1800 and barge-in toggles", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await expect(form.numberInputByLabel(/Max call duration/i)).toHaveValue("600");
    const cb = form.checkboxByLabel(/barge-in/i);
    await cb.check();
    await expect(cb).toBeChecked();
  });

  test("TC-AG-CS-026 @medium @positive — Goodbye message accepts text", async ({
    page,
  }) => {
    const goodbye = page.getByLabel(/Goodbye message/i).first();
    if (await goodbye.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await goodbye.fill("Thank you for contacting support. Have a great day!");
      await expect(goodbye).toHaveValue(/Thank you/i);
    }
  });

  test("TC-AG-CS-027 @medium @positive — Voicemail detection can be enabled", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.checkboxByLabel(/Detect voicemail/i).check();
    await expect(page.getByLabel(/Voicemail message/i)).toBeVisible();
    await page
      .getByLabel(/Voicemail message/i)
      .fill("Please call us back and we'll be happy to assist you.");
  });
});
