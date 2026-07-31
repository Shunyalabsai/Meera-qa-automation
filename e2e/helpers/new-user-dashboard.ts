import { Page } from "@playwright/test";
import { AgentsOnboardingPage } from "../pages/agents-onboarding.page";

/** Returns true when /agents shows the "Get started" onboarding checklist. */
export async function isAgentsEmptyState(page: Page): Promise<boolean> {
  const onboarding = new AgentsOnboardingPage(page);
  await onboarding.open();
  return onboarding.isEmptyState();
}
