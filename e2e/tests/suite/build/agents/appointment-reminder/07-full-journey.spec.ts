import { test, expect } from "@playwright/test";
import { openAppointmentReminderAgentForm, waitForAgentCreated } from "../../../../../helpers/agent.helper";
import { AgentFormPage } from "../../../../../pages/agent-form.page";
import { APPOINTMENT_REMINDER_TEMPLATE } from "../../../../../data/appointment-reminder-template";
import { uniqueName } from "../../../../../utils/test-data";

test.describe("BUILD › Agents › Appointment reminder — Full journey @journey @appointment-reminder", () => {
  test("TC-AG-AR-060 @high @positive — All tabs configured → agent created", async ({
    page,
  }) => {
    const agentName = uniqueName("ApptReminder");
    const form = await openAppointmentReminderAgentForm(page);
    await form.expectNewAgentHeader();

    await form.fillDebtRecoveryConfig({
      name: agentName,
      description: "E2E appointment reminder agent",
      language: "en",
      voiceTone: "professional",
      accent: "neutral",
      gender: "neutral",
      systemPrompt:
        "You are a professional appointment reminder agent. Confirm attendance and offer to reschedule.",
    });

    await form.openTab("Behaviour");
    await form.fillBehaviourFields({
      name: agentName,
      firstMessage: APPOINTMENT_REMINDER_TEMPLATE.defaultFirstMessage,
      goodbyeMessage: "Thank you for confirming. We look forward to seeing you!",
      silenceTimeoutSecs: 10,
      maxCallDurationSecs: 1800,
      bargeIn: true,
      idleRepromptMessage: "Are you still there?",
      idleMaxRetries: 4,
      idleTerminateMessage:
        "It looks like you're busy. Feel free to call back to reschedule.",
    });

    await form.openTab("Recording");
    await form.fillRecordingFields({ name: agentName, recordCalls: true });

    await form.openTab("Outcomes");
    await form.fillOutcomesFields({
      name: agentName,
      extractionSchema: `{
  "appointmentConfirmed": "boolean: did the customer confirm attendance?",
  "rescheduleRequested": "boolean: did the customer ask to reschedule?",
  "newAppointmentDate": "new date if rescheduling was discussed"
}`,
    });

    await form.openTab("Advanced");
    await form.fillAdvancedFields({
      name: agentName,
      temperature: 0.7,
      maxTokens: 300,
    });

    await form.createAgentButton().click();
    await waitForAgentCreated(page);
    await expect(page.getByText(agentName).first()).toBeVisible({ timeout: 15_000 });
  });
});
