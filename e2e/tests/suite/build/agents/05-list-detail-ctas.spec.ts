import { test, expect } from "@playwright/test";
import { AgentsListPage } from "../../../../pages/agents-list.page";
import { AgentDetailPage } from "../../../../pages/agent-detail.page";
import { isAgentsEmptyState } from "../../../../helpers/new-user-dashboard";
import { createDebtRecoveryAgent } from "../../../../helpers/debt-recovery.helper";
import { uniqueName } from "../../../../utils/test-data";

test.describe("BUILD › Agents — List & detail CTAs @agents @cta @serial", () => {
  test.describe.configure({ mode: "serial" });

  let agentName = "";
  let agentId = "";

  test("CTA-AG-001 @high @cta — New agent link opens template gallery", async ({
    page,
  }) => {
    test.skip(await isAgentsEmptyState(page), "Empty onboarding — use Create your first agent CTA instead");

    const agents = new AgentsListPage(page);
    await agents.open();
    await agents.clickNewAgent();
    await expect(page).toHaveURL(/\/agents\/new/, { timeout: 30_000 });
  });

  test("CTA-AG-002 @high @cta — Create agent for detail CTA tests", async ({
    page,
  }) => {
    agentName = uniqueName("CTA_Agent");
    agentId = await createDebtRecoveryAgent(page, {
      name: agentName,
      description: "CTA coverage agent",
      language: "en",
      voiceTone: "professional",
      accent: "neutral",
      gender: "female",
      systemPrompt: "You are a test agent for CTA coverage.",
      firstMessage: "Hello, this is a test call.",
    });
    expect(agentId).toBeTruthy();
  });

  test("CTA-AG-003 @high @cta — Agent row link opens detail page", async ({
    page,
  }) => {
    const agents = new AgentsListPage(page);
    await agents.open();
    await agents.openAgent(agentName);
    await expect(page).toHaveURL(new RegExp(`/agents/${agentId}$`));
  });

  test("CTA-AG-004 @high @cta — Edit link opens agent edit form", async ({
    page,
  }) => {
    const detail = new AgentDetailPage(page);
    await detail.open(agentId);
    await detail.clickEdit();
    await expect(page).toHaveURL(new RegExp(`/agents/${agentId}/edit`));
  });

  test("CTA-AG-005 @high @cta — Playground link navigates from detail", async ({
    page,
  }) => {
    const detail = new AgentDetailPage(page);
    await detail.open(agentId);
    await detail.clickPlayground();
    await expect(page).toHaveURL(/\/playground/, { timeout: 30_000 });
  });

  test("CTA-AG-006 @medium @cta — Clone button creates copy", async ({
    page,
  }, testInfo) => {
    if (!agentName) {
      skipEnvPrecondition(
        testInfo,
        "CTA-AG-002 did not create agent — serial dependency missing",
      );
    }

    const agents = new AgentsListPage(page);
    await agents.open();
    await agents.cloneAgent(agentName);
    await agents.expectAgentVisible(`${agentName} (copy)`);
  });
});
