import { test, expect } from "@playwright/test";
import {
  openOrderConfirmationRescheduleAgentForm,
  gotoNewAgent,
} from "../../../../../helpers/agent.helper";
import { ORDER_CONFIRMATION_RESCHEDULE_TEMPLATE } from "../../../../../data/order-confirmation-reschedule-template";
import { AgentFormPage } from "../../../../../pages/agent-form.page";
import { AgentTemplatePage } from "../../../../../pages/agent-template.page";

test.describe("BUILD › Agents › Order Confirmation & Reschedule — Template @journey @order-confirmation-reschedule @smoke", () => {
  test("TC-AG-OC-001 @smoke @high @positive — Order Confirmation & Reschedule card opens pre-filled form", async ({
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
    await gallery.selectTemplate(ORDER_CONFIRMATION_RESCHEDULE_TEMPLATE.cardTitle);

    const form = new AgentFormPage(page);
    await form.ensureFormReady();
    await form.expectNewAgentHeader();
    await form.expectPromptTabContent();

    const name = await form.nameInput().inputValue();
    expect(name).toMatch(ORDER_CONFIRMATION_RESCHEDULE_TEMPLATE.expectedName);

    await form.expectDropdownSelected(
      form.languageSelect(),
      ORDER_CONFIRMATION_RESCHEDULE_TEMPLATE.expectedLanguage,
    );
    await form.expectDropdownSelected(
      form.voiceToneSelect(),
      ORDER_CONFIRMATION_RESCHEDULE_TEMPLATE.expectedVoiceTone,
    );
    await form.expectDropdownSelected(
      form.accentSelect(),
      ORDER_CONFIRMATION_RESCHEDULE_TEMPLATE.expectedAccent,
    );
    await form.expectDropdownSelected(
      form.genderSelect(),
      ORDER_CONFIRMATION_RESCHEDULE_TEMPLATE.expectedGender,
    );
    await form.expectDropdownSelected(
      form.callDirectionSelect(),
      ORDER_CONFIRMATION_RESCHEDULE_TEMPLATE.defaultCallDirection,
    );

    const prompt = await form.systemPromptInput().inputValue();
    expect(prompt).toMatch(
      ORDER_CONFIRMATION_RESCHEDULE_TEMPLATE.expectedSystemPromptSnippet,
    );
  });

  test("TC-AG-OC-002 @medium @positive — Change template returns to Logistics industry view", async ({
    page,
  }) => {
    await openOrderConfirmationRescheduleAgentForm(page);

    const form = new AgentFormPage(page);
    await form.changeTemplateButton().click();
    await new AgentTemplatePage(page).expectIndustryView("Logistics");
  });
});
