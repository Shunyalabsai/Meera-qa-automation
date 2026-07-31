import { Page, expect } from "@playwright/test";
import { openCreditCardPaymentReminderAgentForm, waitForAgentCreated } from "./agent.helper";
import { gotoApp } from "./navigate";
import { AgentFormPage } from "../pages/agent-form.page";
import type { AgentConfig } from "../pages/agent-form.page";

export function extractAgentIdFromUrl(page: Page): string {
  const match = page.url().match(/\/agents\/([0-9a-f-]+)/);
  if (!match?.[1]) throw new Error(`No agent ID in URL: ${page.url()}`);
  return match[1];
}

/** Create a debt recovery agent and return its ID from the detail URL. */
export async function createCreditCardPaymentReminderAgent(
  page: Page,
  config: AgentConfig,
): Promise<string> {
  const form = await openCreditCardPaymentReminderAgentForm(page);
  await form.fillAgentConfig(config);

  const needsBehaviour =
    config.firstMessage ||
    config.goodbyeMessage ||
    config.silenceTimeoutSecs !== undefined;

  if (needsBehaviour) {
    await form.openTab("Behaviour");
    await form.fillBehaviourFields(config);
  } else {
    const firstMessage = await page.getByLabel(/First message/i).inputValue().catch(() => "");
    if (!firstMessage.trim()) {
      await form.openTab("Behaviour");
      await form.fillBehaviourFields({
        ...config,
        firstMessage:
          "Hi, am I speaking with {{customerName}}? This is Meera regarding your account.",
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
