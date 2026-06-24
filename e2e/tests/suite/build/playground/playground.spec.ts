import { test, expect } from "@playwright/test";
import { PlaygroundPage } from "../../../../pages/playground.page";

test.describe("BUILD › Playground @smoke", () => {
  test("Playground — agent selector and Start call visible", async ({
    page,
  }) => {
    const playground = new PlaygroundPage(page);
    await playground.open();
    await playground.expectReady();
  });

  test("Playground — deep-link pre-selects agent_id", async ({ page }) => {
    const playground = new PlaygroundPage(page);
    await playground.open();
    const agentId = await playground.selectedAgentValue();
    test.skip(!agentId, "No agents available");

    await playground.open(agentId);
    await expect(playground.agentSelect()).toHaveValue(agentId);
  });
});
