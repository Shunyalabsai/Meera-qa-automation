import { test, expect } from "@playwright/test";
import { AgentsListPage } from "../../../../../pages/agents-list.page";
import { skipUnlessHasAgents } from "../../../../../helpers/existing-user.helper";

test.describe("BUILD › Agents — List actions @journey @existing-user @agents @positive", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await skipUnlessHasAgents(page, testInfo);
  });

  test("TC-AG-EU-010 @high @positive — Agent row visible by name", async ({
    page,
  }) => {
    const agents = new AgentsListPage(page);
    const name = await agents.firstAgentName();
    test.skip(!name, "No agent name in list");
    await agents.expectAgentVisible(name!);
  });

  test("TC-AG-EU-011 @medium @positive — Click New agent opens gallery", async ({
    page,
  }) => {
    const agents = new AgentsListPage(page);
    await agents.open();
    if (!(await agents.hasNewAgentLink())) {
      test.skip(true, "New agent link not shown");
    }
    await agents.clickNewAgent();
    await expect(page).toHaveURL(/\/agents\/new/);
  });
});
