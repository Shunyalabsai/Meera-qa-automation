import { test, expect } from "@playwright/test";
import { createRetentionCallAgent } from "../../../../../helpers/retention-call.helper";
import { AgentsListPage } from "../../../../../pages/agents-list.page";
import { uniqueName } from "../../../../../utils/test-data";

test.describe("BUILD › Agents › Retention Call — Lifecycle edge cases @negative @retention-call @edge", () => {
  test("TC-AG-CS-N114 @medium — Delete cancelled keeps agent in list", async ({
    page,
  }) => {
    const name = uniqueName("CS_DeleteCancel");
    await createRetentionCallAgent(page, {
      name,
      firstMessage:
        "Hi, thank you for reaching {{brand}} support. How can I help you today?",
    });

    const agents = new AgentsListPage(page);
    await agents.open();
    await agents.cancelDeleteAgent(name);
    await agents.expectAgentVisible(name);
    await agents.deleteAgent(name);
  });

  test("TC-AG-CS-N115 @medium — Clone cancelled keeps single agent", async ({
    page,
  }) => {
    const name = uniqueName("CS_CloneCancel");
    await createRetentionCallAgent(page, {
      name,
      firstMessage:
        "Hi, thank you for reaching {{brand}} support. How can I help you today?",
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
