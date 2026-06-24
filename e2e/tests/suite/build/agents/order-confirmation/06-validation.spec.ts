import { test, expect } from "@playwright/test";
import { createOrderConfirmationAgent } from "../../../../../helpers/order-confirmation.helper";
import { AgentsListPage } from "../../../../../pages/agents-list.page";
import { uniqueName } from "../../../../../utils/test-data";

test.describe("BUILD › Agents › Order confirmation — Lifecycle edge cases @negative @order-confirmation @edge", () => {
  test("TC-AG-OC-N114 @medium — Delete cancelled keeps agent in list", async ({
    page,
  }) => {
    const name = uniqueName("OC_DeleteCancel");
    await createOrderConfirmationAgent(page, {
      name,
      language: "en",
      firstMessage:
        "Hi {{customerName}}, I'm calling to confirm your order with {{brand}}.",
    });

    const agents = new AgentsListPage(page);
    await agents.open();
    await agents.cancelDeleteAgent(name);
    await agents.expectAgentVisible(name);
    await agents.deleteAgent(name);
  });

  test("TC-AG-OC-N115 @medium — Clone cancelled keeps single agent", async ({
    page,
  }) => {
    const name = uniqueName("OC_CloneCancel");
    await createOrderConfirmationAgent(page, {
      name,
      language: "en",
      firstMessage:
        "Hi {{customerName}}, I'm calling to confirm your order with {{brand}}.",
    });

    const agents = new AgentsListPage(page);
    await agents.open();
    const row = agents.agentRow(name);
    page.once("dialog", (d) => d.dismiss());
    await row.getByRole("button", { name: "Clone" }).click();
    await agents.expectAgentVisible(name);
    await expect(
      page.getByText(`${name} (copy)`, { exact: false }),
    ).not.toBeVisible({ timeout: 3_000 });

    await agents.deleteAgent(name);
  });
});
