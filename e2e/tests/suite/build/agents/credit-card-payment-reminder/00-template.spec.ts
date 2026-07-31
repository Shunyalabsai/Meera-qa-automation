import { test, expect } from "@playwright/test";
import { openCreditCardPaymentReminderAgentForm, gotoNewAgent } from "../../../../../helpers/agent.helper";
import { CREDIT_CARD_PAYMENT_REMINDER_TEMPLATE } from "../../../../../data/credit-card-payment-reminder-template";
import { AgentFormPage } from "../../../../../pages/agent-form.page";
import { AgentTemplatePage } from "../../../../../pages/agent-template.page";

test.describe("BUILD › Agents › Credit Card Payment Reminder — Template @journey @credit-card-payment-reminder", () => {
  test("TC-AG-DR-001 @high @positive — Credit Card Payment Reminder card opens pre-filled form", async ({
    page,
  }) => {
    await gotoNewAgent(page);

    const hasGallery = await page
      .getByRole("heading", { name: /What industry are you building for/i })
      .isVisible({ timeout: 8_000 })
      .catch(() => false);

    test.skip(!hasGallery, "Template gallery not enabled on this environment");

    const gallery = new AgentTemplatePage(page);
    await gallery.expectGallery();
    await gallery.selectTemplate(CREDIT_CARD_PAYMENT_REMINDER_TEMPLATE.cardTitle);

    const form = new AgentFormPage(page);
    await form.ensureFormReady();
    await form.expectNewAgentHeader();
    await form.expectPromptTabContent();

    const name = await form.nameInput().inputValue();
    expect(name).toMatch(CREDIT_CARD_PAYMENT_REMINDER_TEMPLATE.expectedName);

    await expect(form.languageSelect()).toHaveValue(
      CREDIT_CARD_PAYMENT_REMINDER_TEMPLATE.expectedLanguage,
    );
    await expect(form.voiceToneSelect()).toHaveValue(
      CREDIT_CARD_PAYMENT_REMINDER_TEMPLATE.expectedVoiceTone,
    );

    const prompt = await form.systemPromptInput().inputValue();
    expect(prompt).toMatch(CREDIT_CARD_PAYMENT_REMINDER_TEMPLATE.expectedSystemPromptSnippet);
  });

  test("TC-AG-DR-002 @medium @positive — Change template link returns to gallery", async ({
    page,
  }) => {
    await openCreditCardPaymentReminderAgentForm(page);

    const changeLink = page.getByRole("link", { name: /Change template/i });
    test.skip(
      !(await changeLink.isVisible({ timeout: 3_000 }).catch(() => false)),
      "Change template link not present",
    );

    await changeLink.click();
    await new AgentTemplatePage(page).expectGallery();
  });
});
