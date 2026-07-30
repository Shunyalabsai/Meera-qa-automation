import { Page, type TestInfo } from "@playwright/test";
import { AgentsListPage } from "../pages/agents-list.page";
import { CallsListPage } from "../pages/calls-list.page";
import { InsightsPage } from "../pages/insights.page";
import { BillingPage } from "../pages/billing.page";
import { RecordingsPage } from "../pages/recordings.page";
import { CampaignsPage } from "../pages/campaigns.page";
import { PhoneNumbersPage } from "../pages/phone-numbers.page";
import { AlertsPage } from "../pages/alerts.page";
import { WebhooksPage } from "../pages/webhooks.page";
import { WEBHOOK_EVENTS } from "../data/webhooks-data";
import { PromptTemplatesPage } from "../pages/prompt-templates.page";
import { LiveCallsPage } from "../pages/live-calls.page";
import { STAGING_HAS_DATA_SKIP } from "./staging-profile";
import { skipEnvPrecondition } from "./skip";

export async function hasCallRecords(page: Page): Promise<boolean> {
  const calls = new CallsListPage(page);
  await calls.open();
  return calls.hasCallRecords();
}

export async function skipUnlessHasCallRecords(
  page: Page,
  testInfo: TestInfo,
): Promise<void> {
  if (!(await hasCallRecords(page))) {
    skipEnvPrecondition(testInfo, STAGING_HAS_DATA_SKIP.calls);
  }
}

export async function hasInsightsData(page: Page): Promise<boolean> {
  const insights = new InsightsPage(page);
  await insights.open();
  return insights.hasCallData();
}

export async function skipUnlessHasInsightsData(
  page: Page,
  testInfo: TestInfo,
): Promise<void> {
  if (!(await hasInsightsData(page))) {
    skipEnvPrecondition(testInfo, STAGING_HAS_DATA_SKIP.insights);
  }
}

export async function hasBillingUsage(page: Page): Promise<boolean> {
  const billing = new BillingPage(page);
  await billing.open();
  return billing.hasUsageData();
}

export async function skipUnlessHasBillingUsage(
  page: Page,
  testInfo: TestInfo,
): Promise<void> {
  if (!(await hasBillingUsage(page))) {
    skipEnvPrecondition(testInfo, STAGING_HAS_DATA_SKIP.billing);
  }
}

export async function hasRecordings(page: Page): Promise<boolean> {
  const recordings = new RecordingsPage(page);
  await recordings.open();
  return recordings.hasRecordings();
}

export async function skipUnlessHasRecordings(
  page: Page,
  testInfo: TestInfo,
): Promise<void> {
  if (!(await hasRecordings(page))) {
    skipEnvPrecondition(testInfo, STAGING_HAS_DATA_SKIP.recordings);
  }
}

export async function hasAgents(page: Page): Promise<boolean> {
  const agents = new AgentsListPage(page);
  return agents.hasAgentRecords();
}

export async function skipUnlessHasAgents(
  page: Page,
  testInfo: TestInfo,
): Promise<void> {
  if (!(await hasAgents(page))) {
    skipEnvPrecondition(testInfo, STAGING_HAS_DATA_SKIP.agents);
  }
}

export async function hasCampaigns(page: Page): Promise<boolean> {
  const campaigns = new CampaignsPage(page);
  await campaigns.open();
  return !(await campaigns.isEmptyState());
}

export async function skipUnlessHasCampaigns(
  page: Page,
  testInfo: TestInfo,
): Promise<void> {
  if (!(await hasCampaigns(page))) {
    skipEnvPrecondition(testInfo, STAGING_HAS_DATA_SKIP.campaigns);
  }
}

export async function hasPhoneNumbers(page: Page): Promise<boolean> {
  const phoneNumbers = new PhoneNumbersPage(page);
  await phoneNumbers.open();
  return !(await phoneNumbers.isEmptyState());
}

export async function skipUnlessHasPhoneNumbers(
  page: Page,
  testInfo: TestInfo,
): Promise<void> {
  if (!(await hasPhoneNumbers(page))) {
    skipEnvPrecondition(testInfo, STAGING_HAS_DATA_SKIP.phoneNumbers);
  }
}

export async function hasAlertRules(page: Page): Promise<boolean> {
  const alerts = new AlertsPage(page);
  await alerts.open();
  return !(await alerts.isRulesEmptyState());
}

export async function skipUnlessHasAlertRules(
  page: Page,
  testInfo: TestInfo,
): Promise<void> {
  if (!(await hasAlertRules(page))) {
    skipEnvPrecondition(testInfo, STAGING_HAS_DATA_SKIP.alerts);
  }
}

export async function hasWebhookSubscriptions(page: Page): Promise<boolean> {
  const webhooks = new WebhooksPage(page);
  await webhooks.open();
  for (const event of WEBHOOK_EVENTS) {
    const disable = webhooks
      .eventRow(event)
      .getByRole("button", { name: /^Disable$/i });
    if (await disable.isVisible({ timeout: 500 }).catch(() => false)) {
      return true;
    }
  }
  return false;
}

export async function skipUnlessHasWebhookSubscriptions(
  page: Page,
  testInfo: TestInfo,
): Promise<void> {
  if (!(await hasWebhookSubscriptions(page))) {
    skipEnvPrecondition(testInfo, STAGING_HAS_DATA_SKIP.webhooks);
  }
}

export async function hasPromptTemplates(page: Page): Promise<boolean> {
  const prompts = new PromptTemplatesPage(page);
  await prompts.open();
  return !(await prompts.isEmptyState());
}

export async function skipUnlessHasPromptTemplates(
  page: Page,
  testInfo: TestInfo,
): Promise<void> {
  if (!(await hasPromptTemplates(page))) {
    skipEnvPrecondition(testInfo, STAGING_HAS_DATA_SKIP.prompts);
  }
}

export async function hasLiveCalls(page: Page): Promise<boolean> {
  const liveCalls = new LiveCallsPage(page);
  await liveCalls.open();
  return !(await liveCalls.isEmptyState());
}

export async function skipUnlessHasLiveCalls(
  page: Page,
  testInfo: TestInfo,
): Promise<void> {
  if (!(await hasLiveCalls(page))) {
    skipEnvPrecondition(testInfo, STAGING_HAS_DATA_SKIP.liveCalls);
  }
}

export async function hasSelectablePlaygroundAgent(page: Page): Promise<boolean> {
  const { PlaygroundPage } = await import("../pages/playground.page");
  const playground = new PlaygroundPage(page);
  await playground.open();
  return playground.hasSelectableAgent();
}

export async function skipUnlessHasSelectableAgent(
  page: Page,
  testInfo: TestInfo,
): Promise<void> {
  if (!(await hasSelectablePlaygroundAgent(page))) {
    skipEnvPrecondition(testInfo, STAGING_HAS_DATA_SKIP.agents);
  }
}
