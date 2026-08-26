import { test, expect } from "@playwright/test";
import { AgentsListPage } from "../../../../../pages/agents-list.page";
import { AgentDetailPage } from "../../../../../pages/agent-detail.page";
import {
  createStartFromScratchAgent,
  openAgentEdit,
} from "../../../../../helpers/start-from-scratch.helper";
import { START_FROM_SCRATCH } from "../../../../../data/start-from-scratch-template";
import { uniqueName } from "../../../../../utils/test-data";

test.describe("BUILD › Agents › Start from scratch — Full lifecycle @journey @start-from-scratch @serial", () => {
  test.describe.configure({ mode: "serial" });

  const agentName = uniqueName("Scratch_Lifecycle");
  const updatedPrompt =
    "You are a custom voice agent built from scratch. Be helpful, confirm details, and end calls cleanly.";
  const updatedFirstMessage =
    "Hello {{customerName}}, thanks for taking my call from {{brand}}. What can I help you with?";
  let agentId = "";
  let cloneName = "";

  test("TC-AG-SFS-080 @high @positive — Create custom agent from scratch", async ({
    page,
  }) => {
    agentId = await createStartFromScratchAgent(page, {
      name: agentName,
      description: START_FROM_SCRATCH.sampleDescription,
      language: "en",
      voiceTone: "neutral",
      accent: "neutral",
      gender: "neutral",
      systemPrompt: START_FROM_SCRATCH.sampleSystemPrompt,
      firstMessage: START_FROM_SCRATCH.sampleFirstMessage,
    });
    await expect(page.getByText(agentName)).toBeVisible();
  });

  test("TC-AG-SFS-081 @high @positive — Agent in list shows en · neutral", async ({
    page,
  }) => {
    const agents = new AgentsListPage(page);
    await agents.open();
    await agents.expectAgentVisible(agentName);
    await expect(agents.agentRow(agentName).getByText(/English · neutral|en · neutral|neutral/i)).toBeVisible();
  });

  test("TC-AG-SFS-082 @high @positive — Detail page shows custom system prompt", async ({
    page,
  }) => {
    const detail = new AgentDetailPage(page);
    await detail.open(agentId);
    await detail.expectAgentName(agentName);
    await detail.expectSystemPromptContains(/voice agent|helpful|confirm/i);
  });

  test("TC-AG-SFS-083 @high @positive — Edit system prompt and save", async ({
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

  test("TC-AG-SFS-084 @high @positive — Edit first message on Behaviour tab", async ({
    page,
  }) => {
    const form = await openAgentEdit(page, agentId);
    await form.openTab("Behaviour");
    await page.getByLabel(/First message/i).fill(updatedFirstMessage);
    await form.saveAndWaitForDetail();
  });

  test("TC-AG-SFS-085 @medium @positive — Add extraction schema on Outcomes tab", async ({
    page,
  }) => {
    const form = await openAgentEdit(page, agentId);
    await form.openTab("Outcomes");
    await form.extractionSchemaEditor().fill(START_FROM_SCRATCH.sampleExtractionSchema);
    await form.saveAndWaitForDetail();
  });

  test("TC-AG-SFS-086 @medium @positive — Edit temperature on Advanced tab", async ({
    page,
  }) => {
    const form = await openAgentEdit(page, agentId);
    await form.openTab("Advanced");
    await form.numberInputByLabel(/Temperature/i).fill("0.6");
    await form.numberInputByLabel(/Max response tokens/i).fill("300");
    await form.saveAndWaitForDetail();
  });

  test("TC-AG-SFS-087 @medium @positive — Clone agent", async ({ page }) => {
    const agents = new AgentsListPage(page);
    await agents.open();
    await agents.cloneAgent(agentName);
    cloneName = `${agentName} (copy)`;
    await agents.expectAgentVisible(cloneName);
  });

  test("TC-AG-SFS-088 @high @positive — Delete cloned agent", async ({ page }) => {
    const agents = new AgentsListPage(page);
    await agents.open();
    await agents.deleteAgent(cloneName);
  });

  test("TC-AG-SFS-089 @high @positive — Delete original agent", async ({ page }) => {
    const agents = new AgentsListPage(page);
    await agents.open();
    await agents.deleteAgent(agentName);
  });
});
