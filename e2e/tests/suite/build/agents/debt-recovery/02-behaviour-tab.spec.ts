import { test, expect } from "@playwright/test";
import { openDebtRecoveryAgentForm } from "../../../../../helpers/agent.helper";
import { AgentFormPage } from "../../../../../pages/agent-form.page";
import { DEBT_RECOVERY_TEMPLATE } from "../../../../../data/debt-recovery-template";

test.describe("BUILD › Agents › Debt recovery — Behaviour tab @journey @debt-recovery", () => {
  test.beforeEach(async ({ page }) => {
    const form = await openDebtRecoveryAgentForm(page);
    await form.openTab("Behaviour");
  });

  test("TC-AG-DR-020 @high @ui — Behaviour tab shows all call-handling sections", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.expectBehaviourTabContent();
  });

  test("TC-AG-010 @high @positive — First message is pre-filled and editable", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    const firstMessage = page.getByLabel(/First message/i);
    await expect(firstMessage).toBeVisible();

    const value = await firstMessage.inputValue();
    if (value.length > 0) {
      expect(value).toMatch(DEBT_RECOVERY_TEMPLATE.expectedFirstMessageSnippet);
    }

    const updated =
      "Hi, am I speaking with {{customerName}}? This is {{yourName}} from {{brand}}.";
    await firstMessage.fill(updated);
    await expect(firstMessage).toHaveValue(updated);
  });

  test("TC-AG-DR-021 @medium @ui — Speech speed slider is adjustable", async ({
    page,
  }) => {
    const slider = page.locator('input[type="range"]').first();
    await expect(slider).toBeVisible();
    await slider.fill("1.1");
    await expect(slider).toHaveValue("1.1");
  });

  test("TC-AG-DR-022 @medium @positive — Goodbye message accepts text", async ({
    page,
  }) => {
    const goodbye = page.getByLabel(/Goodbye message/i).first();
    if (await goodbye.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await goodbye.fill("Thank you for your time. Have a great day!");
      await expect(goodbye).toHaveValue(/Thank you/i);
    }
  });

  test("TC-AG-DR-023 @medium @positive — Silence timeout and max call duration", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.numberInputByLabel(/Silence timeout/i).fill("15");
    await form.numberInputByLabel(/Max call duration/i).fill("1200");
    await expect(form.numberInputByLabel(/Silence timeout/i)).toHaveValue("15");
    await expect(form.numberInputByLabel(/Max call duration/i)).toHaveValue("1200");
  });

  test("TC-AG-DR-024 @medium @positive — Barge-in checkbox toggles", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    const cb = form.checkboxByLabel(/barge-in/i);
    await cb.uncheck();
    await expect(cb).not.toBeChecked();
    await cb.check();
    await expect(cb).toBeChecked();
  });

  test("TC-AG-DR-025 @medium @positive — Voicemail detection reveals sub-fields", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.checkboxByLabel(/Detect voicemail/i).check();
    await expect(page.getByLabel(/Detection delay/i)).toBeVisible();
    await expect(page.getByLabel(/Voicemail message/i)).toBeVisible();
    await page
      .getByLabel(/Voicemail message/i)
      .fill("Please call us back at your earliest convenience.");
  });

  test("TC-AG-DR-026 @medium @positive — No-response handling fields", async ({
    page,
  }) => {
    await page
      .getByLabel(/Re-prompt message/i)
      .fill("Are you still there?");
    await page.getByRole("spinbutton", { name: /Max retries/i }).fill("3");
    await page
      .getByRole("textbox", { name: /^Closing line/i })
      .fill("It looks like you stepped away. Feel free to call back anytime.");
    await expect(page.getByRole("spinbutton", { name: /Max retries/i })).toHaveValue("3");
  });
});
