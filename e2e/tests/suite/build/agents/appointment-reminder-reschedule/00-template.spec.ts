import { test, expect } from "@playwright/test";
import {
  openAppointmentReminderRescheduleAgentForm,
  gotoNewAgent,
} from "../../../../../helpers/agent.helper";
import { APPOINTMENT_REMINDER_RESCHEDULE_TEMPLATE } from "../../../../../data/appointment-reminder-reschedule-template";
import { AgentFormPage } from "../../../../../pages/agent-form.page";
import { AgentTemplatePage } from "../../../../../pages/agent-template.page";

test.describe("BUILD › Agents › Appointment Reminder & Reschedule — Template @journey @appointment-reminder-reschedule", () => {
  test("TC-AG-AR-001 @high @positive — Appointment Reminder & Reschedule card opens pre-filled form", async ({
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
    await gallery.selectTemplate(APPOINTMENT_REMINDER_RESCHEDULE_TEMPLATE.cardTitle);

    const form = new AgentFormPage(page);
    await form.ensureFormReady();
    await form.expectNewAgentHeader();
    await form.expectPromptTabContent();

    expect(await form.nameInput().inputValue()).toMatch(
      APPOINTMENT_REMINDER_RESCHEDULE_TEMPLATE.expectedName,
    );
    await expect(form.languageSelect()).toHaveValue(
      APPOINTMENT_REMINDER_RESCHEDULE_TEMPLATE.expectedLanguage,
    );
    await expect(form.voiceToneSelect()).toHaveValue(
      APPOINTMENT_REMINDER_RESCHEDULE_TEMPLATE.expectedVoiceTone,
    );
    await expect(form.accentSelect()).toHaveValue(
      APPOINTMENT_REMINDER_RESCHEDULE_TEMPLATE.expectedAccent,
    );
    await expect(form.genderSelect()).toHaveValue(
      APPOINTMENT_REMINDER_RESCHEDULE_TEMPLATE.expectedGender,
    );
    await expect(form.callDirectionSelect()).toHaveValue(
      APPOINTMENT_REMINDER_RESCHEDULE_TEMPLATE.defaultCallDirection,
    );

    const prompt = await form.systemPromptInput().inputValue();
    expect(prompt).toMatch(
      APPOINTMENT_REMINDER_RESCHEDULE_TEMPLATE.expectedSystemPromptSnippet,
    );
  });

  test("TC-AG-AR-002 @medium @positive — Change template returns to Healthcare industry view", async ({
    page,
  }) => {
    await openAppointmentReminderRescheduleAgentForm(page);
    const form = new AgentFormPage(page);
    await form.changeTemplateButton().click();
    await new AgentTemplatePage(page).expectIndustryView("Healthcare");
  });
});
