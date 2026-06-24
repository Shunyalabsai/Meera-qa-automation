import { test, expect } from "@playwright/test";
import { openCustomerSupportAgentForm, waitForAgentCreated } from "../../../../../helpers/agent.helper";
import { AgentFormPage } from "../../../../../pages/agent-form.page";
import { CUSTOMER_SUPPORT_TEMPLATE } from "../../../../../data/customer-support-template";
import { uniqueName } from "../../../../../utils/test-data";

test.describe("BUILD › Agents › Customer support — Full journey @journey @customer-support", () => {
  test("TC-AG-CS-060 @high @positive — All tabs configured → agent created", async ({
    page,
  }) => {
    const agentName = uniqueName("SupportAgent");
    const form = await openCustomerSupportAgentForm(page);
    await form.expectNewAgentHeader();

    await form.fillDebtRecoveryConfig({
      name: agentName,
      description: "E2E inbound customer support agent",
      language: "en",
      voiceTone: "warm",
      accent: "neutral",
      gender: "neutral",
      systemPrompt:
        "You are a helpful customer support agent. Be empathetic and escalate complex issues.",
    });

    await form.openTab("Behaviour");
    await form.fillBehaviourFields({
      name: agentName,
      firstMessage: CUSTOMER_SUPPORT_TEMPLATE.defaultFirstMessage,
      goodbyeMessage: "Thank you for contacting support. Have a great day!",
      silenceTimeoutSecs: 10,
      maxCallDurationSecs: 1800,
      bargeIn: true,
      voicemailEnabled: true,
      voicemailMessage: "Please call us back and we'll assist you.",
      idleRepromptMessage: "Are you still there?",
      idleMaxRetries: 2,
      idleTerminateMessage:
        "It looks like you stepped away. Feel free to call back anytime.",
    });

    await form.openTab("Recording");
    await form.fillRecordingFields({ name: agentName, recordCalls: true });

    await form.openTab("Outcomes");
    await form.fillOutcomesFields({
      name: agentName,
      extractionSchema: `{
  "issueType": "category of the customer's issue",
  "issueResolved": "boolean: was the issue fully resolved?",
  "escalationNeeded": "boolean: did the call require human handoff?"
}`,
      escalationEnabled: true,
      transferTarget: "#support-escalations",
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
