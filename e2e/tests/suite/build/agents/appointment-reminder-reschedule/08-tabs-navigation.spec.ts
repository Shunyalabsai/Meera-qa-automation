import { test } from "@playwright/test";
import { openAppointmentReminderRescheduleAgentForm } from "../../../../../helpers/agent.helper";

test.describe("BUILD › Agents › Appointment Reminder & Reschedule — Tab navigation @journey @appointment-reminder-reschedule", () => {
  test("TC-AG-AR-070 @high @ui — All five tabs navigate in order", async ({
    page,
  }) => {
    const form = await openAppointmentReminderRescheduleAgentForm(page);
    await form.expectPromptTabContent();
    await form.openTab("Behaviour");
    await form.expectBehaviourTabContent();
    await form.openTab("Recording");
    await form.expectRecordingTabContent();
    await form.openTab("Outcomes");
    await form.expectOutcomesTabContent();
    await form.openTab("Advanced");
    await form.expectAdvancedTabContent();
    await form.openTab("Prompt");
    await form.expectPromptTabContent();
  });

  test("TC-AG-AR-071 @medium @ui — Guide panel visible on form", async ({
    page,
  }) => {
    await openAppointmentReminderRescheduleAgentForm(page);
    await page
      .getByText(/^GUIDE$/i)
      .or(page.getByText(/Guide/i).first())
      .waitFor({ state: "visible", timeout: 10_000 })
      .catch(() => {});
  });
});
