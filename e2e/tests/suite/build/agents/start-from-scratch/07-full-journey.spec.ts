import { test, expect } from "@playwright/test";
import {
  openStartFromScratchAgentForm,
  waitForAgentCreated,
} from "../../../../../helpers/agent.helper";
import { AgentFormPage } from "../../../../../pages/agent-form.page";
import { START_FROM_SCRATCH } from "../../../../../data/start-from-scratch-template";
import { uniqueName } from "../../../../../utils/test-data";

test.describe("BUILD › Agents › Start from scratch — Full journey @journey @start-from-scratch", () => {
  test("TC-AG-SFS-060 @high @positive — Blank form fully configured → agent created", async ({
    page,
  }) => {
    const agentName = uniqueName("ScratchAgent");
    const form = await openStartFromScratchAgentForm(page);
    await form.expectNewAgentHeader();

    await form.fillDebtRecoveryConfig({
      name: agentName,
      description: START_FROM_SCRATCH.sampleDescription,
      language: "hinglish",
      voiceTone: "professional",
      accent: "indian",
      gender: "female",
      systemPrompt: START_FROM_SCRATCH.sampleSystemPrompt,
    });

    await form.openTab("Behaviour");
    await form.fillBehaviourFields({
      name: agentName,
      firstMessage: START_FROM_SCRATCH.sampleFirstMessage,
      goodbyeMessage: "Thank you for your time. Have a great day!",
      silenceTimeoutSecs: 10,
      maxCallDurationSecs: 1800,
      bargeIn: true,
      voicemailEnabled: true,
      voicemailMessage: "Please call us back when convenient.",
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
      extractionSchema: START_FROM_SCRATCH.sampleExtractionSchema,
      escalationEnabled: true,
      transferTarget: "#custom-escalations",
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
