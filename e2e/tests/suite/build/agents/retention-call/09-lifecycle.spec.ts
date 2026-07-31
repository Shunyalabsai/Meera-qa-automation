import { test, expect } from "@playwright/test";
import { AgentsListPage } from "../../../../../pages/agents-list.page";
import { AgentDetailPage } from "../../../../../pages/agent-detail.page";
import {
  createRetentionCallAgent,
  openAgentEdit,
} from "../../../../../helpers/retention-call.helper";
import { RETENTION_CALL_TEMPLATE } from "../../../../../data/retention-call-template";
import { uniqueName } from "../../../../../utils/test-data";

test.describe("BUILD › Agents › Retention Call — Full lifecycle @journey @retention-call @serial", () => {
  test.describe.configure({ mode: "serial" });

  const agentName = uniqueName("Support_Lifecycle");
  const updatedPrompt =
    "You are an expert customer support agent. Diagnose issues systematically and escalate when resolution is not possible on the call.";
  const updatedFirstMessage =
    "Hello {{customerName}}, thank you for calling {{brand}} support. How may I help you today?";
  let agentId = "";
  let cloneName = "";

  test("TC-AG-CS-080 @high @positive — Create customer support agent", async ({
    page,
  }) => {
    agentId = await createRetentionCallAgent(page, {
      name: agentName,
      description: "Lifecycle E2E customer support agent",
      language: "en",
      voiceTone: "warm",
      accent: "neutral",
      gender: "neutral",
      systemPrompt:
        "You are a helpful customer support agent. Understand issues and resolve efficiently.",
      firstMessage: RETENTION_CALL_TEMPLATE.defaultFirstMessage,
    });
    await expect(page.getByText(agentName)).toBeVisible();
  });

  test("TC-AG-CS-081 @high @positive — Agent in list shows en · warm", async ({
    page,
  }) => {
    const agents = new AgentsListPage(page);
    await agents.open();
    await agents.expectAgentVisible(agentName);
    await expect(agents.agentRow(agentName).getByText(/en · warm/i)).toBeVisible();
  });

  test("TC-AG-CS-082 @high @positive — Detail page shows support system prompt", async ({
    page,
  }) => {
    const detail = new AgentDetailPage(page);
    await detail.open(agentId);
    await detail.expectAgentName(agentName);
    await detail.expectSystemPromptContains(/support|empathetic|escalate/i);
  });

  test("TC-AG-CS-083 @high @positive — Edit system prompt and save", async ({
    page,
  }) => {
    const form = await openAgentEdit(page, agentId);
    await form.expectEditHeader(agentName);
    const prompt = form.systemPromptInput();
    if (await prompt.isEditable({ timeout: 3_000 }).catch(() => false)) {
      await prompt.fill(updatedPrompt);
    }
    await form.saveAndWaitForDetail();
  });

  test("TC-AG-CS-084 @high @positive — Edit first message on Behaviour tab", async ({
    page,
  }) => {
    const form = await openAgentEdit(page, agentId);
    await form.openTab("Behaviour");
    await page.getByLabel(/First message/i).fill(updatedFirstMessage);
    await form.saveAndWaitForDetail();
  });

  test("TC-AG-CS-085 @medium @positive — Enable escalation on Outcomes tab", async ({
    page,
  }) => {
    const form = await openAgentEdit(page, agentId);
    await form.openTab("Outcomes");
    await form.checkboxByLabel(/Enable escalation/i).check();
    await page.getByLabel(/Handoff target/i).fill("+14155551111");
    await form.saveAndWaitForDetail();
    await expect(page.getByText(/14155551111/)).toBeVisible();
  });

  test("TC-AG-CS-086 @medium @positive — Edit temperature on Advanced tab", async ({
    page,
  }) => {
    const form = await openAgentEdit(page, agentId);
    await form.openTab("Advanced");
    await form.numberInputByLabel(/Temperature/i).fill("0.8");
    await form.numberInputByLabel(/Max response tokens/i).fill("300");
    await form.saveAndWaitForDetail();
  });

  test("TC-AG-CS-087 @medium @positive — Clone agent", async ({ page }) => {
    const agents = new AgentsListPage(page);
    await agents.open();
    await agents.cloneAgent(agentName);
    cloneName = `${agentName} (copy)`;
    await agents.expectAgentVisible(cloneName);
  });

  test("TC-AG-CS-088 @high @positive — Delete cloned agent", async ({ page }) => {
    const agents = new AgentsListPage(page);
    await agents.open();
    await agents.deleteAgent(cloneName);
  });

  test("TC-AG-CS-089 @high @positive — Delete original agent", async ({ page }) => {
    const agents = new AgentsListPage(page);
    await agents.open();
    await agents.deleteAgent(agentName);
  });
});
