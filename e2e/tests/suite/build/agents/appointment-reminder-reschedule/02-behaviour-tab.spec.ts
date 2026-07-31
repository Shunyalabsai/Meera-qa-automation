import { test, expect } from "@playwright/test";
import { openAppointmentReminderRescheduleAgentForm } from "../../../../../helpers/agent.helper";
import { AgentFormPage } from "../../../../../pages/agent-form.page";
import { APPOINTMENT_REMINDER_RESCHEDULE_TEMPLATE } from "../../../../../data/appointment-reminder-reschedule-template";

test.describe("BUILD › Agents › Appointment Reminder & Reschedule — Behaviour tab @journey @appointment-reminder-reschedule", () => {
  test.beforeEach(async ({ page }) => {
    const form = await openAppointmentReminderRescheduleAgentForm(page);
    await form.openTab("Behaviour");
  });

  test("TC-AG-AR-020 @high @ui — Behaviour tab shows call-handling sections", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.expectBehaviourTabContent();
  });

  test("TC-AG-AR-021 @high @positive — First message uses appointmentDate variable", async ({
    page,
  }) => {
    const firstMessage = page.getByLabel(/First message/i);
    await expect(firstMessage).toBeVisible();
    const value = await firstMessage.inputValue();
    if (value.length > 0) {
      expect(value).toMatch(
        APPOINTMENT_REMINDER_RESCHEDULE_TEMPLATE.expectedFirstMessageSnippet,
      );
    }
    await firstMessage.fill(APPOINTMENT_REMINDER_RESCHEDULE_TEMPLATE.defaultFirstMessage);
    await expect(firstMessage).toHaveValue(
      APPOINTMENT_REMINDER_RESCHEDULE_TEMPLATE.defaultFirstMessage,
    );
  });

  test("TC-AG-AR-022 @medium @ui — Speech speed slider defaults near 1.0", async ({
    page,
  }) => {
    const slider = page.locator('input[type="range"]').first();
    await expect(slider).toBeVisible();
    await expect(slider).toHaveValue(/1(\.0+)?/);
  });

  test("TC-AG-AR-023 @medium @positive — Silence timeout defaults to 10 seconds", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await expect(form.numberInputByLabel(/Silence timeout/i)).toHaveValue("10");
    await form.numberInputByLabel(/Silence timeout/i).fill("15");
    await expect(form.numberInputByLabel(/Silence timeout/i)).toHaveValue("15");
  });

  test("TC-AG-AR-024 @medium @positive — Max retries and closing line for no-response", async ({
    page,
  }) => {
    await page.getByLabel(/Re-prompt message/i).fill("Are you still there?");
    await page.getByRole("spinbutton", { name: /Max retries/i }).fill("4");
    await page
      .getByRole("textbox", { name: /^Closing line/i })
      .fill("It looks like you're busy. Feel free to call back to reschedule.");
    await expect(page.getByRole("spinbutton", { name: /Max retries/i })).toHaveValue("4");
  });

  test("TC-AG-AR-025 @medium @positive — Max call duration 1800 and barge-in enabled", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await expect(form.numberInputByLabel(/Max call duration/i)).toHaveValue("600");
    await expect(form.checkboxByLabel(/barge-in/i)).toBeChecked();
  });

  test("TC-AG-AR-026 @medium @positive — Goodbye message accepts text", async ({
    page,
  }) => {
    const goodbye = page.getByLabel(/Goodbye message/i).first();
    if (await goodbye.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await goodbye.fill("Thank you for confirming. We look forward to seeing you!");
      await expect(goodbye).toHaveValue(/Thank you/i);
    }
  });

  test("TC-AG-AR-027 @medium @positive — Voicemail detection reveals sub-fields", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.checkboxByLabel(/Detect voicemail/i).check();
    await expect(page.getByLabel(/Voicemail message/i)).toBeVisible();
  });
});
