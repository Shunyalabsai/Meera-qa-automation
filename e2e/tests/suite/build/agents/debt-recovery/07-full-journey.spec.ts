import { test, expect } from "@playwright/test";
import { openDebtRecoveryAgentForm, waitForAgentCreated } from "../../../../../helpers/agent.helper";
import { AgentFormPage } from "../../../../../pages/agent-form.page";
import { uniqueName } from "../../../../../utils/test-data";

test.describe("BUILD › Agents › Debt recovery — Full journey @journey @debt-recovery", () => {
  test("TC-AG-DR-060 @high @positive — All tabs configured → agent created", async ({
    page,
  }) => {
    const agentName = uniqueName("DebtRecovery");
    const form = await openDebtRecoveryAgentForm(page);
    await form.expectNewAgentHeader();

    await form.fillDebtRecoveryConfig({
      name: agentName,
      description: "E2E debt recovery agent for overdue payment calls",
      language: "hinglish",
      voiceTone: "assertive",
      accent: "indian",
      gender: "female",
      systemPrompt:
        "You are a professional recovery agent. Collect commitment dates politely but firmly.",
    });

    await form.openTab("Behaviour");
    await form.fillBehaviourFields({
      name: agentName,
      firstMessage:
        "Hi, am I speaking with {{customerName}}? This is Meera from {{brand}} regarding your account.",
      goodbyeMessage: "Thank you for your time. Have a great day!",
      silenceTimeoutSecs: 10,
      maxCallDurationSecs: 1800,
      bargeIn: true,
      voicemailEnabled: true,
      voicemailMessage: "Please call us back to discuss your account.",
      idleRepromptMessage: "Are you still there?",
      idleMaxRetries: 2,
      idleTerminateMessage: "Feel free to call us back anytime.",
    });

    await form.openTab("Recording");
    await form.fillRecordingFields({ name: agentName, recordCalls: true });

    await form.openTab("Outcomes");
    await form.fillOutcomesFields({
      name: agentName,
      extractionSchema: `{
  "commitmentDate": "date customer promised to pay",
  "amountAgreed": "amount agreed"
}`,
      escalationEnabled: true,
      transferTarget: "+14155559999",
    });

    await form.openTab("Advanced");
    await form.fillAdvancedFields({
      name: agentName,
      temperature: 0.7,
      maxTokens: 300,
      preCallApiEnabled: true,
      preCallApiUrl: "https://api.example.com/pre-call",
      preCallApiMethod: "POST",
    });

    await form.createAgentButton().click();

    await waitForAgentCreated(page);
    await expect(page.getByText(agentName).first()).toBeVisible({ timeout: 15_000 });
  });
});
