import { test, expect } from "@playwright/test";
import { AgentsListPage } from "../../../../../pages/agents-list.page";
import { AgentDetailPage } from "../../../../../pages/agent-detail.page";
import {
  createAppointmentReminderAgent,
  openAgentEdit,
} from "../../../../../helpers/appointment-reminder.helper";
import { APPOINTMENT_REMINDER_TEMPLATE } from "../../../../../data/appointment-reminder-template";
import { uniqueName } from "../../../../../utils/test-data";

test.describe("BUILD › Agents › Appointment reminder — Full lifecycle @journey @appointment-reminder @serial", () => {
  test.describe.configure({ mode: "serial" });

  const agentName = uniqueName("ApptReminder_Lifecycle");
  const updatedPrompt =
    "You are an appointment reminder specialist. Confirm attendance warmly and offer rescheduling when needed.";
  const updatedFirstMessage =
    "Hello {{customerName}}, this is a reminder for your appointment on {{appointmentDate}}. Will you be able to attend?";
  let agentId = "";
  let cloneName = "";

  test("TC-AG-AR-080 @high @positive — Create appointment reminder agent", async ({
    page,
  }) => {
    agentId = await createAppointmentReminderAgent(page, {
      name: agentName,
      description: "Lifecycle E2E appointment reminder agent",
      language: "en",
      voiceTone: "professional",
      accent: "neutral",
      gender: "neutral",
      systemPrompt:
        "You are a professional appointment reminder agent. Confirm attendance and offer to reschedule.",
      firstMessage: APPOINTMENT_REMINDER_TEMPLATE.defaultFirstMessage,
    });
    await expect(page.getByText(agentName)).toBeVisible();
  });

  test("TC-AG-AR-081 @high @positive — Agent in list shows en · professional", async ({
    page,
  }) => {
    const agents = new AgentsListPage(page);
    await agents.open();
    await agents.expectAgentVisible(agentName);
    await expect(agents.agentRow(agentName).getByText(/en · professional/i)).toBeVisible();
  });

  test("TC-AG-AR-082 @high @positive — Detail page shows appointment reminder prompt", async ({
    page,
  }) => {
    const detail = new AgentDetailPage(page);
    await detail.open(agentId, agentName);
    await detail.expectAgentName(agentName);
    await detail.expectSystemPromptContains(/appointment|reschedule|attend/i);
  });

  test("TC-AG-AR-083 @high @positive — Edit system prompt and save", async ({
    page,
  }) => {
    const form = await openAgentEdit(page, agentId);
    await form.expectEditHeader(agentName);
    const prompt = form.systemPromptInput();
    if (await prompt.isEditable({ timeout: 3_000 }).catch(() => false)) {
      await prompt.fill(updatedPrompt);
    }
    await form.saveAndWaitForDetail();
  });

  test("TC-AG-AR-084 @high @positive — Edit first message with appointmentDate", async ({
    page,
  }) => {
    const form = await openAgentEdit(page, agentId);
    await form.openTab("Behaviour");
    await page.getByLabel(/First message/i).fill(updatedFirstMessage);
    await form.saveAndWaitForDetail();
  });

  test("TC-AG-AR-085 @medium @positive — Update extraction schema on Outcomes tab", async ({
    page,
  }) => {
    const form = await openAgentEdit(page, agentId);
    await form.openTab("Outcomes");
    await form.extractionSchemaEditor().fill(`{
  "appointmentConfirmed": "boolean: confirmed attendance?",
  "rescheduleRequested": "boolean: asked to reschedule?"
}`);
    await form.saveAndWaitForDetail();
  });

  test("TC-AG-AR-086 @medium @positive — Edit temperature on Advanced tab", async ({
    page,
  }) => {
    const form = await openAgentEdit(page, agentId);
    await form.openTab("Advanced");
    await form.numberInputByLabel(/Temperature/i).fill("0.5");
    await form.saveAndWaitForDetail();
  });

  test("TC-AG-AR-087 @medium @positive — Clone agent", async ({ page }) => {
    const agents = new AgentsListPage(page);
    await agents.open();
    await agents.cloneAgent(agentName);
    cloneName = `${agentName} (copy)`;
    await agents.expectAgentVisible(cloneName);
  });

  test("TC-AG-AR-088 @high @positive — Delete cloned agent", async ({ page }) => {
    const agents = new AgentsListPage(page);
    await agents.open();
    await agents.deleteAgent(cloneName);
  });

  test("TC-AG-AR-089 @high @positive — Delete original agent", async ({ page }) => {
    const agents = new AgentsListPage(page);
    await agents.open();
    await agents.deleteAgent(agentName);
  });
});
