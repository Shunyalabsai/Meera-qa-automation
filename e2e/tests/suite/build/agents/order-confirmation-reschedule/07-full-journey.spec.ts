import { test, expect } from "@playwright/test";
import {
  openOrderConfirmationRescheduleAgentForm,
  waitForAgentCreated,
} from "../../../../../helpers/agent.helper";
import { AgentFormPage } from "../../../../../pages/agent-form.page";
import { ORDER_CONFIRMATION_RESCHEDULE_TEMPLATE } from "../../../../../data/order-confirmation-reschedule-template";
import { uniqueName } from "../../../../../utils/test-data";

test.describe("BUILD › Agents › Order Confirmation & Reschedule — Full journey @journey @order-confirmation-reschedule", () => {
  test("TC-AG-OC-060 @high @positive — All tabs configured → agent created", async ({
    page,
  }) => {
    const agentName = uniqueName("OrderConfirm");
    const form = await openOrderConfirmationRescheduleAgentForm(page);
    await form.expectNewAgentHeader();

    await form.fillAgentConfig({
      name: agentName,
      description: "E2E order confirmation agent for post-purchase calls",
      language: "hinglish",
      voiceTone: "warm",
      accent: "neutral",
      gender: "neutral",
      systemPrompt:
        "You are a friendly order confirmation agent. Confirm delivery and resolve issues.",
    });

    await form.openTab("Behaviour");
    await form.fillBehaviourFields({
      name: agentName,
      firstMessage: ORDER_CONFIRMATION_RESCHEDULE_TEMPLATE.defaultFirstMessage,
      goodbyeMessage: "Thank you for confirming your order. Have a great day!",
      silenceTimeoutSecs: 3,
      maxCallDurationSecs: 1800,
      bargeIn: true,
      idleRepromptMessage: "Are you still there?",
      idleMaxRetries: 3,
      idleTerminateMessage:
        "It looks like our connection was lost. Feel free to call back anytime.",
    });

    await form.openTab("Recording");
    await form.fillRecordingFields({ name: agentName, recordCalls: true });

    await form.openTab("Outcomes");
    await form.fillOutcomesFields({
      name: agentName,
      extractionSchema: `{
  "buyingIntent": "integer 1-10 indicating purchase likelihood",
  "orderConfirmed": "boolean: did the customer confirm the order?",
  "updatedAddress": "any address corrections the customer mentioned"
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
