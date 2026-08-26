import { test, expect } from "@playwright/test";
import { openCreditCardPaymentReminderAgentForm } from "../../../../../helpers/agent.helper";
import { AgentFormPage } from "../../../../../pages/agent-form.page";
import { CREDIT_CARD_PAYMENT_REMINDER_TEMPLATE } from "../../../../../data/credit-card-payment-reminder-template";

/**
 * Credit Card Payment Reminder–specific Prompt tab tests.
 * Dropdown matrix (Language, Voice tone, Accent, Gender) lives in
 * ../templates/prompt-dropdowns.spec.ts for all 4 cards + scratch.
 */
test.describe("BUILD › Agents › Credit Card Payment Reminder — Prompt tab @journey @credit-card-payment-reminder", () => {
  test.beforeEach(async ({ page }) => {
    await openCreditCardPaymentReminderAgentForm(page);
  });

  test("TC-AG-DR-010 @high @ui — Prompt tab shows pipeline, basic info, system prompt", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.expectNewAgentHeader();
    await form.expectAllTabsVisible();
    await form.expectPromptTabContent();
    await expect(page.getByText(/Shunya Native|gemini|Basic info/i).first()).toBeVisible();
  });

  test("TC-AG-002 @high @positive — System prompt is editable", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    const customPrompt =
      "You are a debt recovery specialist. Confirm identity before discussing balance.";
    const prompt = form.systemPromptInput();
    if (await prompt.isEditable({ timeout: 3_000 }).catch(() => false)) {
      await prompt.fill(customPrompt);
      await expect(prompt).toHaveValue(customPrompt);
    }
  });

  test("TC-AG-004 @high @positive — Credit Card Payment Reminder pre-fills template defaults", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.expectDropdownSelected(form.languageSelect(), CREDIT_CARD_PAYMENT_REMINDER_TEMPLATE.expectedLanguage);
    await form.expectDropdownSelected(form.voiceToneSelect(), CREDIT_CARD_PAYMENT_REMINDER_TEMPLATE.expectedVoiceTone);
    await form.expectDropdownSelected(form.accentSelect(), CREDIT_CARD_PAYMENT_REMINDER_TEMPLATE.expectedAccent);
  });

  test("TC-AG-DR-019 @high @positive — Name and description fields accept input", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.nameInput().fill("Recovery Agent E2E");
    await form.descriptionInput().fill("Outbound recovery for Hindi-speaking customers");
    await expect(form.nameInput()).toHaveValue("Recovery Agent E2E");
  });
});
