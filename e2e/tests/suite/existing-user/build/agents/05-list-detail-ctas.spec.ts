import { test, expect } from "@playwright/test";
import { AgentsListPage } from "../../../../../pages/agents-list.page";
import { AgentDetailPage } from "../../../../../pages/agent-detail.page";
import { skipUnlessHasAgents } from "../../../../../helpers/existing-user.helper";
import { skipEnvPrecondition } from "../../../../../helpers/skip";

test.describe("BUILD › Agents — List & detail CTAs @journey @existing-user @agents @cta @serial", () => {
  test.describe.configure({ mode: "serial" });

  let agentName = "";
  let agentId = "";

  test("CTA-AG-EU-001 @high @cta — New agent link opens template gallery", async ({
    page,
  }, testInfo) => {
    await skipUnlessHasAgents(page, testInfo);
    const agents = new AgentsListPage(page);
    await agents.open();
    if (!(await agents.hasNewAgentLink())) {
      skipEnvPrecondition(testInfo, "New agent link not shown on populated list");
      return;
    }
    await agents.clickNewAgent();
    await expect(page).toHaveURL(/\/agents\/new/);
  });

  test("CTA-AG-EU-002 @high @cta — Resolve first agent for detail CTAs", async ({
    page,
  }, testInfo) => {
    await skipUnlessHasAgents(page, testInfo);
    const agents = new AgentsListPage(page);
    agentName = (await agents.firstAgentName()) ?? "";
    test.skip(!agentName, "No agent name in list");
    await agents.openAgent(agentName);
    const match = page.url().match(/\/agents\/([0-9a-f-]+)/i);
    agentId = match?.[1] ?? "";
    expect(agentId).toBeTruthy();
  });

  test("CTA-AG-EU-003 @high @cta — Agent row opens detail page", async ({
    page,
  }, testInfo) => {
    test.skip(!agentName, "CTA-AG-EU-002 did not resolve agent");
    const agents = new AgentsListPage(page);
    await agents.open();
    await agents.openAgent(agentName);
    await expect(page).toHaveURL(new RegExp(`/agents/${agentId}`));
  });

  test("CTA-AG-EU-004 @high @cta — Edit link opens agent edit form", async ({
    page,
  }, testInfo) => {
    test.skip(!agentId, "CTA-AG-EU-002 did not resolve agent");
    const detail = new AgentDetailPage(page);
    await detail.open(agentId);
    await detail.clickEdit();
    await expect(page).toHaveURL(new RegExp(`/agents/${agentId}/edit`));
  });

  test("CTA-AG-EU-005 @high @cta — Playground link navigates from detail", async ({
    page,
  }, testInfo) => {
    test.skip(!agentId, "CTA-AG-EU-002 did not resolve agent");
    const detail = new AgentDetailPage(page);
    await detail.open(agentId);
    await detail.clickPlayground();
    await expect(page).toHaveURL(/\/playground/, { timeout: 30_000 });
  });

  test("CTA-AG-EU-006 @medium @cta — Clone button creates copy", async ({
    page,
  }, testInfo) => {
    test.skip(!agentName, "CTA-AG-EU-002 did not resolve agent");
    const agents = new AgentsListPage(page);
    await agents.open();
    await agents.cloneAgent(agentName);
    await agents.expectAgentVisible(`${agentName} (copy)`);
  });
});
