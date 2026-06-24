import { Page, expect } from "@playwright/test";
import { openOrderConfirmationAgentForm, waitForAgentCreated } from "./agent.helper";
import { gotoApp } from "./navigate";
import { AgentFormPage } from "../pages/agent-form.page";
import type { DebtRecoveryAgentConfig } from "../pages/agent-form.page";
import { ORDER_CONFIRMATION_TEMPLATE } from "../data/order-confirmation-template";

export function extractAgentIdFromUrl(page: Page): string {
  const match = page.url().match(/\/agents\/([0-9a-f-]+)/);
  if (!match?.[1]) throw new Error(`No agent ID in URL: ${page.url()}`);
  return match[1];
}

export async function createOrderConfirmationAgent(
  page: Page,
  config: DebtRecoveryAgentConfig,
): Promise<string> {
  const form = await openOrderConfirmationAgentForm(page);
  await form.fillDebtRecoveryConfig(config);

  const needsBehaviour =
    config.firstMessage ||
    config.goodbyeMessage ||
    config.silenceTimeoutSecs !== undefined;

  if (needsBehaviour) {
    await form.openTab("Behaviour");
    await form.fillBehaviourFields(config);
  } else {
    await form.openTab("Behaviour");
    const firstMessage = await page.getByLabel(/First message/i).inputValue();
    if (!firstMessage.trim()) {
      await form.fillBehaviourFields({
        ...config,
        firstMessage: ORDER_CONFIRMATION_TEMPLATE.defaultFirstMessage,
      });
    }
  }

  if (config.recordCalls !== undefined) {
    await form.openTab("Recording");
    await form.fillRecordingFields(config);
  }
  if (config.escalationEnabled || config.extractionSchema) {
    await form.openTab("Outcomes");
    await form.fillOutcomesFields(config);
  }
  if (
    config.temperature !== undefined ||
    config.maxTokens !== undefined ||
    config.preCallApiEnabled
  ) {
    await form.openTab("Advanced");
    await form.fillAdvancedFields(config);
  }

  await form.openTab("Prompt");
  await form.createAgentButton().click();
  return waitForAgentCreated(page);
}

export async function openAgentEdit(
  page: Page,
  agentId: string,
): Promise<AgentFormPage> {
  await gotoApp(page, `agents/${agentId}/edit`);
  await expect(page).toHaveURL(new RegExp(`/agents/${agentId}/edit`), {
    timeout: 30_000,
  });
  const form = new AgentFormPage(page);
  await expect(page.getByRole("tab", { name: "Prompt" })).toBeVisible({
    timeout: 30_000,
  });
  return form;
}
