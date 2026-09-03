import { test, expect } from "@playwright/test";
import { openCreditCardPaymentReminderAgentForm, gotoNewAgent } from "../../../../../helpers/agent.helper";
import { CREDIT_CARD_PAYMENT_REMINDER_TEMPLATE } from "../../../../../data/credit-card-payment-reminder-template";
import { AgentFormPage } from "../../../../../pages/agent-form.page";
import { AgentTemplatePage } from "../../../../../pages/agent-template.page";

test.describe("BUILD › Agents › Credit Card Payment Reminder — Template @journey @credit-card-payment-reminder @smoke", () => {
  test("TC-AG-DR-001 @smoke @high @positive — Credit Card Payment Reminder card opens pre-filled form", async ({
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

    await form.expectDropdownSelected(
      form.languageSelect(),
      CREDIT_CARD_PAYMENT_REMINDER_TEMPLATE.expectedLanguage,
    );
    await form.expectDropdownSelected(
      form.voiceToneSelect(),
      CREDIT_CARD_PAYMENT_REMINDER_TEMPLATE.expectedVoiceTone,
    );
    await form.expectDropdownSelected(
      form.callDirectionSelect(),
      CREDIT_CARD_PAYMENT_REMINDER_TEMPLATE.defaultCallDirection,
    );

    const prompt = await form.systemPromptInput().inputValue();
    expect(prompt).toMatch(CREDIT_CARD_PAYMENT_REMINDER_TEMPLATE.expectedSystemPromptSnippet);
  });

  test("TC-AG-DR-002 @medium @positive — Change template returns to BFSI industry view", async ({
    page,
  }) => {
    await openCreditCardPaymentReminderAgentForm(page);

    const form = new AgentFormPage(page);
    await form.changeTemplateButton().click();
    await new AgentTemplatePage(page).expectIndustryView("BFSI");
  });
});
