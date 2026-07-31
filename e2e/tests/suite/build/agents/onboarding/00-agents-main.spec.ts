import { test, expect } from "@playwright/test";
import { AgentsOnboardingPage } from "../../../../../pages/agents-onboarding.page";
import { isAgentsEmptyState } from "../../../../../helpers/new-user-dashboard";

test.describe("BUILD › Agents — Main screen (new user) @journey @new-user @onboarding", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(
      !(await isAgentsEmptyState(page)),
      "Agents onboarding empty state not shown — user may already have agents",
    );
  });

  test("TC-AG-ON-001 @high @ui — Empty state shows Get started checklist", async ({
    page,
  }) => {
    const onboarding = new AgentsOnboardingPage(page);
    await onboarding.expectEmptyState();
  });

  test("TC-AG-ON-002 @high @ui — Agents heading visible on main screen", async ({
    page,
  }) => {
    await expect(page.getByRole("heading", { name: "Agents" })).toBeVisible();
  });

  test("TC-AG-ON-003 @high @ui — Step 1 Create an agent guidance text", async ({
    page,
  }) => {
    await expect(page.getByText(/Create an agent/i).first()).toBeVisible();
    await expect(
      page.getByText(/Define what your agent does, how it speaks, and what it says/i),
    ).toBeVisible();
  });

  test("TC-AG-ON-004 @high @ui — Step 2 Add a phone number guidance text", async ({
    page,
  }) => {
    await expect(page.getByText(/Add a phone number/i).first()).toBeVisible();
    await expect(
      page.getByText(/Assign an inbound or outbound number so calls can be made/i),
    ).toBeVisible();
  });

  test("TC-AG-ON-005 @high @ui — Step 3 Test in Playground guidance text", async ({
    page,
  }) => {
    await expect(page.getByText(/Test in Playground/i).first()).toBeVisible();
    await expect(
      page.getByText(/Make a live test call before going to production/i),
    ).toBeVisible();
  });

  test("TC-AG-ON-005b @high @ui — Step 4 Run a campaign guidance text", async ({
    page,
  }) => {
    await expect(page.getByText(/Run a campaign/i).first()).toBeVisible();
    await expect(
      page.getByText(/Reach your customers at scale with automated outbound calls/i),
    ).toBeVisible();
  });

  test("TC-AG-ON-006 @high @positive — New agent CTA is visible", async ({
    page,
  }) => {
    const onboarding = new AgentsOnboardingPage(page);
    await expect(onboarding.newAgentCta().first()).toBeVisible();
  });

  test("TC-AG-ON-007 @medium @ui — Four onboarding step links are present", async ({
    page,
  }) => {
    const onboarding = new AgentsOnboardingPage(page);
    await onboarding.expectAllSteps();
  });
});
