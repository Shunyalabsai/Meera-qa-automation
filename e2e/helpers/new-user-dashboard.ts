import { Page } from "@playwright/test";
import { AgentsOnboardingPage } from "../pages/agents-onboarding.page";

/** Assertions for the post-sign-up Agents onboarding dashboard (new user). */
export async function expectNewUserAgentsDashboard(page: Page): Promise<void> {
  const onboarding = new AgentsOnboardingPage(page);
  await onboarding.open();
  await onboarding.expectEmptyState();
}

/** Returns true when /agents shows the new-user onboarding hero (no agents yet). */
export async function isAgentsEmptyState(page: Page): Promise<boolean> {
  const onboarding = new AgentsOnboardingPage(page);
  await onboarding.open();
  return onboarding.isEmptyState();
}
