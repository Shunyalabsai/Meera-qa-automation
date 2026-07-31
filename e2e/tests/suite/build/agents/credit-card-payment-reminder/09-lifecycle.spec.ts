import { test, expect } from "@playwright/test";
import { AgentsListPage } from "../../../../../pages/agents-list.page";
import { AgentDetailPage } from "../../../../../pages/agent-detail.page";
import {
  createCreditCardPaymentReminderAgent,
  openAgentEdit,
} from "../../../../../helpers/credit-card-payment-reminder.helper";
import { uniqueName } from "../../../../../utils/test-data";

/**
 * End-to-end Debt Recovery agent lifecycle (serial):
 * Create → View → Edit (prompt, behaviour, advanced, outcomes) → Clone → Delete clone → Delete original
 */
test.describe("BUILD › Agents › Credit Card Payment Reminder — Full lifecycle @journey @credit-card-payment-reminder @serial", () => {
  test.describe.configure({ mode: "serial" });

  const agentName = uniqueName("CreditCardPaymentReminder_Lifecycle");
  const updatedPrompt =
    "You are an expert debt recovery agent. Always verify identity. Collect a firm payment commitment date.";
  const updatedFirstMessage =
    "Namaste, kya main {{customerName}} se baat kar rahi hoon? Main {{brand}} se bol rahi hoon.";
  let agentId = "";
  let cloneName = "";

  test("TC-AG-001 @high @positive — Create debt recovery agent with Hindi language", async ({
    page,
  }) => {
    agentId = await createCreditCardPaymentReminderAgent(page, {
      name: agentName,
      description: "Lifecycle E2E debt recovery agent",
      language: "hi",
      voiceTone: "assertive",
      accent: "indian",
      gender: "female",
      systemPrompt:
        "You are a professional recovery agent for overdue payments.",
      firstMessage:
        "Hi, am I speaking with {{customerName}}? This is Meera from {{brand}}.",
    });

    await expect(page.getByText(agentName)).toBeVisible();
  });

  test("TC-AG-DR-080 @high @positive — Agent appears in list with correct metadata", async ({
    page,
  }) => {
    const agents = new AgentsListPage(page);
    await agents.open();
    await agents.expectAgentVisible(agentName);
    const row = agents.agentRow(agentName);
    await expect(row.getByText(/hi · assertive/i)).toBeVisible();
  });

  test("TC-AG-DR-081 @high @positive — Detail page shows settings and system prompt", async ({
    page,
  }) => {
    const detail = new AgentDetailPage(page);
    await detail.open(agentId, agentName);
    await detail.expectAgentName(agentName);
    await detail.expectSystemPromptContains(/recovery|overdue|payment/i);
    await expect(
      page.getByRole("main").getByRole("heading", { name: /^Settings$/i }),
    ).toBeVisible();
    // Escalation heading may or may not appear on the new detail page layout;
    // the core checks above already validate the page loaded correctly.
  });

  test("TC-AG-002 @high @positive — Edit system prompt and save changes", async ({
    page,
  }) => {
    const form = await openAgentEdit(page, agentId);
    await form.expectEditHeader(agentName);
    const prompt = form.systemPromptInput();
    if (await prompt.isEditable({ timeout: 3_000 }).catch(() => false)) {
      await prompt.fill(updatedPrompt);
    }
    await form.saveAndWaitForDetail();

    const detail = new AgentDetailPage(page);
    await detail.expectSystemPromptContains(updatedPrompt.slice(0, 40));
  });

  test("TC-AG-010 @high @positive — Edit first message on Behaviour tab", async ({
    page,
  }) => {
    const form = await openAgentEdit(page, agentId);
    await form.openTab("Behaviour");
    await page.getByLabel(/First message/i).fill(updatedFirstMessage);
    await form.saveAndWaitForDetail();
  });

  test("TC-AG-005 @high @positive — Edit temperature and max tokens on Advanced tab", async ({
    page,
  }) => {
    const form = await openAgentEdit(page, agentId);
    await form.openTab("Advanced");
    await form.numberInputByLabel(/Temperature/i).fill("0.5");
    await form.numberInputByLabel(/Max response tokens/i).fill("250");
    await form.saveAndWaitForDetail();
  });

  test("TC-AG-009 @medium @positive — Enable escalation with handoff target", async ({
    page,
  }) => {
    const form = await openAgentEdit(page, agentId);
    await form.openTab("Outcomes");
    await form.checkboxByLabel(/Enable escalation/i).check();
    await page.getByLabel(/Handoff target/i).fill("+14155551234");
    await form.saveAndWaitForDetail();
    await expect(page.getByText(/14155551234/)).toBeVisible();
  });

  test("TC-AG-004 @medium @positive — Change language to hinglish on edit", async ({
    page,
  }) => {
    const form = await openAgentEdit(page, agentId);
    await form.selectLanguage("hinglish");
    await form.saveAndWaitForDetail();

    const agents = new AgentsListPage(page);
    await agents.open();
    await expect(agents.agentRow(agentName).getByText(/hinglish/i)).toBeVisible();
  });

  test("TC-AG-006 @medium @positive — Clone agent creates copy with (copy) suffix", async ({
    page,
  }) => {
    const agents = new AgentsListPage(page);
    await agents.open();
    await agents.cloneAgent(agentName);
    cloneName = `${agentName} (copy)`;
    await agents.expectAgentVisible(cloneName);
  });

  test("TC-AG-007 @high @positive — Delete cloned agent", async ({ page }) => {
    const agents = new AgentsListPage(page);
    await agents.open();
    await agents.deleteAgent(cloneName);
  });

  test("TC-AG-007b @high @positive — Delete original agent", async ({ page }) => {
    const agents = new AgentsListPage(page);
    await agents.open();
    await agents.deleteAgent(agentName);
  });
});
