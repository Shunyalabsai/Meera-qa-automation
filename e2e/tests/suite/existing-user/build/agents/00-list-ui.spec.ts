import { test, expect } from "@playwright/test";
import { AgentsListPage } from "../../../../../pages/agents-list.page";
import { skipUnlessHasAgents } from "../../../../../helpers/existing-user.helper";

test.describe("BUILD › Agents — Populated list @journey @existing-user @agents @ui", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await skipUnlessHasAgents(page, testInfo);
  });

  test("TC-AG-EU-001 @high @ui — Agent list shows records", async ({ page }) => {
    const agents = new AgentsListPage(page);
    await agents.open();
    expect(await agents.agentListItems().count()).toBeGreaterThan(0);
  });

  test("TC-AG-EU-002 @high @ui — New agent link visible", async ({ page }) => {
    const agents = new AgentsListPage(page);
    await agents.open();
    expect(await agents.hasNewAgentLink()).toBe(true);
  });

  test("TC-AG-EU-003 @medium @ui — Open first agent detail", async ({ page }) => {
    const agents = new AgentsListPage(page);
    const name = await agents.firstAgentName();
    test.skip(!name, "No agent name in list");
    await agents.openAgent(name!);
    await expect(page).toHaveURL(/\/agents\/[0-9a-f-]+$/);
  });
});
