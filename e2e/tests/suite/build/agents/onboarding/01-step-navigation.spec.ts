import { test, expect } from "@playwright/test";
import { AgentsOnboardingPage } from "../../../../../pages/agents-onboarding.page";
import { PhoneNumbersPage } from "../../../../../pages/phone-numbers.page";
import { PlaygroundPage } from "../../../../../pages/playground.page";
import { isAgentsEmptyState } from "../../../../../helpers/new-user-dashboard";

test.describe("BUILD › Agents — Onboarding step navigation @journey @new-user @onboarding", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(
      !(await isAgentsEmptyState(page)),
      "Agents onboarding empty state not shown — user may already have agents",
    );
  });

  test("TC-AG-ON-010 @high @positive — Create your first agent CTA opens /agents/new", async ({
    page,
  }) => {
    const onboarding = new AgentsOnboardingPage(page);
    await onboarding.clickCreateFirstAgentCta();
    await expect(page).toHaveURL(/\/agents\/new/, { timeout: 30_000 });
  });

  test("TC-AG-ON-011 @high @positive — Step 1 Create an agent navigates to /agents/new", async ({
    page,
  }) => {
    const onboarding = new AgentsOnboardingPage(page);
    await onboarding.clickCreateAgentStep();
    await expect(page).toHaveURL(/\/agents\/new/, { timeout: 30_000 });
  });

  test("TC-AG-ON-012 @high @positive — Step 2 Add a phone number opens Phone numbers page", async ({
    page,
  }) => {
    const onboarding = new AgentsOnboardingPage(page);
    await onboarding.clickAddPhoneNumberStep();
    await expect(page).toHaveURL(/\/phone-numbers/, { timeout: 30_000 });

    const phoneNumbers = new PhoneNumbersPage(page);
    await phoneNumbers.expectEmptyState();
  });

  test("TC-AG-ON-013 @high @positive — Step 3 Test in Playground opens Playground page", async ({
    page,
  }) => {
    const onboarding = new AgentsOnboardingPage(page);
    await onboarding.clickTestInPlaygroundStep();
    await expect(page).toHaveURL(/\/playground/, { timeout: 30_000 });

    const playground = new PlaygroundPage(page);
    await playground.expectNewUserPlayground();
  });
});

test.describe("RUN › Phone numbers — From onboarding @journey @new-user @onboarding", () => {
  test("TC-AG-ON-020 @high @ui — Phone numbers empty state for new user", async ({
    page,
  }) => {
    const phoneNumbers = new PhoneNumbersPage(page);
    await phoneNumbers.open();
    await phoneNumbers.expectEmptyState();
    await expect(phoneNumbers.addNumberButton()).toBeEnabled();
  });

  test("TC-AG-ON-021 @medium @ui — Telephony accounts section shows zero count", async ({
    page,
  }) => {
    const phoneNumbers = new PhoneNumbersPage(page);
    await phoneNumbers.open();
    await expect(page.getByText(/Telephony accounts\s*\(\s*0\s*\)/i)).toBeVisible({
      timeout: 15_000,
    });
  });
});

test.describe("BUILD › Playground — From onboarding @journey @new-user @onboarding", () => {
  test("TC-AG-ON-030 @high @ui — Playground shows agent picker and Browser mode", async ({
    page,
  }) => {
    const playground = new PlaygroundPage(page);
    await playground.open();
    await playground.expectNewUserPlayground();
  });

  test("TC-AG-ON-031 @medium @positive — Browser and Phone Call mode toggle", async ({
    page,
  }) => {
    const playground = new PlaygroundPage(page);
    await playground.open();
    await playground.switchToPhoneMode();
    await playground.switchToBrowserMode();
  });

  test("TC-AG-ON-032 @medium @ui — Log panel shows idle before any call", async ({
    page,
  }) => {
    const playground = new PlaygroundPage(page);
    await playground.open();
    await expect(page.getByText(/idle|No activity yet/i).first()).toBeVisible();
  });
});
