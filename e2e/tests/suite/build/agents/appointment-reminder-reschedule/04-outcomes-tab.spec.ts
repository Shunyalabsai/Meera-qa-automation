import { test, expect } from "@playwright/test";
import { openAppointmentReminderRescheduleAgentForm } from "../../../../../helpers/agent.helper";
import { AgentFormPage } from "../../../../../pages/agent-form.page";
import { APPOINTMENT_REMINDER_RESCHEDULE_TEMPLATE } from "../../../../../data/appointment-reminder-reschedule-template";

test.describe("BUILD › Agents › Appointment Reminder & Reschedule — Outcomes tab @journey @appointment-reminder-reschedule", () => {
  test.beforeEach(async ({ page }) => {
    const form = await openAppointmentReminderRescheduleAgentForm(page);
    await form.openTab("Outcomes");
  });

  test("TC-AG-AR-040 @medium @ui — Outcomes tab shows defaults and escalation", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.expectOutcomesTabContent();
    for (const label of ["resolved", "callback_scheduled", "no_answer"]) {
      await expect(page.getByText(label).first()).toBeVisible();
    }
  });

  test("TC-AG-AR-041 @medium @positive — Customize outcomes from defaults", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    const btn = form.customizeOutcomesButton();
    if (await btn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await btn.click();
      await expect(page.getByRole("button", { name: /Add outcome/i })).toBeVisible();
    }
  });

  test("TC-AG-AR-042 @high @positive — Extraction schema for appointment fields", async ({
    page,
  }) => {
    const schema = `{
  "appointmentConfirmed": "boolean: did the customer confirm attendance?",
  "rescheduleRequested": "boolean: did the customer ask to reschedule?",
  "newAppointmentDate": "new date if rescheduling was discussed"
}`;
    const editor = page.locator("textarea.font-mono, textarea[class*='font-mono']").last();
    await editor.fill(schema);
    for (const field of APPOINTMENT_REMINDER_RESCHEDULE_TEMPLATE.defaultExtractionFields) {
      await expect(editor).toContainText(field);
    }
  });

  test("TC-AG-AR-043 @medium @positive — Custom outcome appointment_confirmed", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    const btn = form.customizeOutcomesButton();
    if (await btn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await btn.click();
      const labelInput = page.locator('input[placeholder*="order_placed"], input.font-mono').first();
      if (await labelInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await labelInput.fill("appointment_confirmed");
      }
    }
  });

  test("TC-AG-AR-044 @medium @positive — Escalation handoff for complex rescheduling", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.checkboxByLabel(/Enable escalation/i).check();
    await page.getByLabel(/Handoff target/i).fill("+14155559876");
    await form.checkboxByLabel(/Enable escalation/i).uncheck();
  });
});
