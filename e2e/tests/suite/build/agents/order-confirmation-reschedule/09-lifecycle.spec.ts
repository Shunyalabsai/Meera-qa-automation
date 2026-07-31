import { test, expect } from "@playwright/test";
import { AgentsListPage } from "../../../../../pages/agents-list.page";
import { AgentDetailPage } from "../../../../../pages/agent-detail.page";
import { AgentFormPage } from "../../../../../pages/agent-form.page";
import {
  createOrderConfirmationRescheduleAgent,
  openAgentEdit,
} from "../../../../../helpers/order-confirmation-reschedule.helper";
import { ORDER_CONFIRMATION_RESCHEDULE_TEMPLATE } from "../../../../../data/order-confirmation-reschedule-template";
import { uniqueName } from "../../../../../utils/test-data";

/**
 * Order Confirmation & Reschedule lifecycle (serial):
 * Create → View → Edit → Clone → Delete
 */
test.describe("BUILD › Agents › Order Confirmation & Reschedule — Full lifecycle @journey @order-confirmation-reschedule @serial", () => {
  test.describe.configure({ mode: "serial" });

  const agentName = uniqueName("OrderConfirm_Lifecycle");
  const updatedPrompt =
    "You are an order confirmation specialist. Verify order details, delivery date, and note any issues warmly.";
  const updatedFirstMessage =
    "Hi {{customerName}}, main {{brand}} se bol rahi hoon — aapka order confirm karne ke liye call kiya hai.";
  let agentId = "";
  let cloneName = "";

  test("TC-AG-OC-080 @high @positive — Create order confirmation agent", async ({
    page,
  }) => {
    agentId = await createOrderConfirmationRescheduleAgent(page, {
      name: agentName,
      description: "Lifecycle E2E order confirmation agent",
      language: "hinglish",
      voiceTone: "warm",
      accent: "neutral",
      gender: "neutral",
      systemPrompt:
        "You are a friendly order confirmation agent. Confirm delivery and resolve issues.",
      firstMessage: ORDER_CONFIRMATION_RESCHEDULE_TEMPLATE.defaultFirstMessage,
    });

    await expect(page.getByText(agentName)).toBeVisible();
  });

  test("TC-AG-OC-081 @high @positive — Agent appears in list with hinglish · warm", async ({
    page,
  }) => {
    const agents = new AgentsListPage(page);
    await agents.open();
    await agents.expectAgentVisible(agentName);
    await expect(agents.agentRow(agentName).getByText(/hinglish · warm/i)).toBeVisible();
  });

  test("TC-AG-OC-082 @high @positive — Detail page shows order confirmation prompt", async ({
    page,
  }) => {
    const detail = new AgentDetailPage(page);
    await detail.open(agentId);
    await detail.expectAgentName(agentName);
    await detail.expectSystemPromptContains(/order|confirm|delivery/i);
  });

  test("TC-AG-OC-083 @high @positive — Edit system prompt and save", async ({
    page,
  }) => {
    const form = await openAgentEdit(page, agentId);
    await form.expectEditHeader(agentName);
    const prompt = form.systemPromptInput();
    if (await prompt.isEditable({ timeout: 3_000 }).catch(() => false)) {
      await prompt.fill(updatedPrompt);
    }
    await form.saveAndWaitForDetail();
    await new AgentDetailPage(page).expectSystemPromptContains(
      updatedPrompt.slice(0, 30),
    );
  });

  test("TC-AG-OC-084 @high @positive — Edit first message on Behaviour tab", async ({
    page,
  }) => {
    const form = await openAgentEdit(page, agentId);
    await form.openTab("Behaviour");
    await page.getByLabel(/First message/i).fill(updatedFirstMessage);
    await form.saveAndWaitForDetail();
  });

  test("TC-AG-OC-085 @medium @positive — Update extraction schema on Outcomes tab", async ({
    page,
  }) => {
    const form = await openAgentEdit(page, agentId);
    await form.openTab("Outcomes");
    await form.extractionSchemaEditor().fill(`{
  "orderConfirmed": "boolean: did the customer confirm the order?",
  "deliveryIssue": "any delivery problem mentioned"
}`);
    await form.saveAndWaitForDetail();
  });

  test("TC-AG-OC-086 @medium @positive — Edit temperature on Advanced tab", async ({
    page,
  }) => {
    const form = await openAgentEdit(page, agentId);
    await form.openTab("Advanced");
    await form.numberInputByLabel(/Temperature/i).fill("0.5");
    await form.numberInputByLabel(/Max response tokens/i).fill("250");
    await form.saveAndWaitForDetail();
  });

  test("TC-AG-OC-087 @medium @positive — Clone agent", async ({ page }) => {
    const agents = new AgentsListPage(page);
    await agents.open();
    await agents.cloneAgent(agentName);
    cloneName = `${agentName} (copy)`;
    await agents.expectAgentVisible(cloneName);
  });

  test("TC-AG-OC-088 @high @positive — Delete cloned agent", async ({ page }) => {
    const agents = new AgentsListPage(page);
    await agents.open();
    await agents.deleteAgent(cloneName);
  });

  test("TC-AG-OC-089 @high @positive — Delete original agent", async ({ page }) => {
    const agents = new AgentsListPage(page);
    await agents.open();
    await agents.deleteAgent(agentName);
  });
});
