import { test, expect } from "@playwright/test";
import { createStartFromScratchAgent } from "../../../../../helpers/start-from-scratch.helper";
import { AgentsListPage } from "../../../../../pages/agents-list.page";
import { uniqueName } from "../../../../../utils/test-data";
import { START_FROM_SCRATCH } from "../../../../../data/start-from-scratch-template";

test.describe("BUILD › Agents › Start from scratch — Lifecycle edge cases @negative @start-from-scratch @edge", () => {
  test("TC-AG-SFS-N114 @medium — Delete cancelled keeps agent in list", async ({
    page,
  }) => {
    const name = uniqueName("SFS_DeleteCancel");
    await createStartFromScratchAgent(page, {
      name,
      description: START_FROM_SCRATCH.sampleDescription,
      language: "en",
      voiceTone: "neutral",
      firstMessage: START_FROM_SCRATCH.sampleFirstMessage,
    });

    const agents = new AgentsListPage(page);
    await agents.open();
    await agents.cancelDeleteAgent(name);
    await agents.expectAgentVisible(name);
    await agents.deleteAgent(name);
  });

  test("TC-AG-SFS-N115 @medium — Clone cancelled keeps single agent", async ({
    page,
  }) => {
    const name = uniqueName("SFS_CloneCancel");
    await createStartFromScratchAgent(page, {
      name,
      language: "en",
      firstMessage: START_FROM_SCRATCH.sampleFirstMessage,
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
