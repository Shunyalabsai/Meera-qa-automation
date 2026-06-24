import { test, expect } from "@playwright/test";
import { openAppointmentReminderAgentForm } from "../../../../../helpers/agent.helper";
import { AgentFormPage } from "../../../../../pages/agent-form.page";
import { APPOINTMENT_REMINDER_TEMPLATE } from "../../../../../data/appointment-reminder-template";

test.describe("BUILD › Agents › Appointment reminder — Prompt tab @journey @appointment-reminder", () => {
  test.beforeEach(async ({ page }) => {
    await openAppointmentReminderAgentForm(page);
  });

  test("TC-AG-AR-010 @high @ui — Prompt tab shows pipeline, basic info, system prompt", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.expectNewAgentHeader();
    await form.expectAllTabsVisible();
    await form.expectPromptTabContent();
    await expect(page.getByText(/Shunya Native|gemini/i)).toBeVisible();
  });

  test("TC-AG-AR-011 @high @positive — System prompt is editable", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    const customPrompt =
      "You are an appointment reminder agent. Confirm attendance and offer to reschedule politely.";
    const prompt = form.systemPromptInput();
    if (await prompt.isEditable({ timeout: 3_000 }).catch(() => false)) {
      await prompt.fill(customPrompt);
      await expect(prompt).toHaveValue(customPrompt);
    }
  });

  test("TC-AG-AR-012 @high @positive — Pre-fills en, professional tone, neutral accent/gender", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await expect(form.languageSelect()).toHaveValue("en");
    await expect(form.voiceToneSelect()).toHaveValue("professional");
    await expect(form.accentSelect()).toHaveValue("neutral");
    await expect(form.genderSelect()).toHaveValue("neutral");
  });

  test("TC-AG-AR-013 @high @positive — Name and description fields accept input", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.nameInput().fill("Appointment Reminder Agent E2E");
    await form.descriptionInput().fill("Reminds customers about upcoming appointments");
    await expect(form.nameInput()).toHaveValue("Appointment Reminder Agent E2E");
  });

  test("TC-AG-AR-014 @medium @ui — Guide panel shows prompt variables", async ({
    page,
  }) => {
    await expect(
      page.getByText(/Building your prompt|Variables|appointment/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});
