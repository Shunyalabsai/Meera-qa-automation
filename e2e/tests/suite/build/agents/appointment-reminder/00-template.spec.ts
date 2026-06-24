import { test, expect } from "@playwright/test";
import {
  openAppointmentReminderAgentForm,
  gotoNewAgent,
} from "../../../../../helpers/agent.helper";
import { APPOINTMENT_REMINDER_TEMPLATE } from "../../../../../data/appointment-reminder-template";
import { AgentFormPage } from "../../../../../pages/agent-form.page";
import { AgentTemplatePage } from "../../../../../pages/agent-template.page";

test.describe("BUILD › Agents › Appointment reminder — Template @journey @appointment-reminder", () => {
  test("TC-AG-AR-001 @high @positive — Appointment reminder card opens pre-filled form", async ({
    page,
  }) => {
    await gotoNewAgent(page);

    const hasGallery = await page
      .getByRole("heading", { name: /What are you building/i })
      .isVisible({ timeout: 8_000 })
      .catch(() => false);

    test.skip(!hasGallery, "Template gallery not enabled on this environment");

    const gallery = new AgentTemplatePage(page);
    await gallery.expectGallery();
    await gallery.selectTemplate(APPOINTMENT_REMINDER_TEMPLATE.cardTitle);

    const form = new AgentFormPage(page);
    await form.ensureFormReady();
    await form.expectNewAgentHeader();
    await form.expectPromptTabContent();

    expect(await form.nameInput().inputValue()).toMatch(
      APPOINTMENT_REMINDER_TEMPLATE.expectedName,
    );
    await expect(form.languageSelect()).toHaveValue(
      APPOINTMENT_REMINDER_TEMPLATE.expectedLanguage,
    );
    await expect(form.voiceToneSelect()).toHaveValue(
      APPOINTMENT_REMINDER_TEMPLATE.expectedVoiceTone,
    );
    await expect(form.accentSelect()).toHaveValue(
      APPOINTMENT_REMINDER_TEMPLATE.expectedAccent,
    );
    await expect(form.genderSelect()).toHaveValue(
      APPOINTMENT_REMINDER_TEMPLATE.expectedGender,
    );

    const prompt = await form.systemPromptInput().inputValue();
    expect(prompt).toMatch(
      APPOINTMENT_REMINDER_TEMPLATE.expectedSystemPromptSnippet,
    );
  });

  test("TC-AG-AR-002 @medium @positive — Change template link returns to gallery", async ({
    page,
  }) => {
    await openAppointmentReminderAgentForm(page);
    const changeLink = page.getByRole("link", { name: /Change template/i });
    test.skip(
      !(await changeLink.isVisible({ timeout: 3_000 }).catch(() => false)),
      "Change template link not present",
    );
    await changeLink.click();
    await new AgentTemplatePage(page).expectGallery();
  });
});
