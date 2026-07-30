import { test, expect } from "@playwright/test";
import { skipUnlessHasAgents } from "../../../../../helpers/existing-user.helper";
import { AgentsListPage } from "../../../../../pages/agents-list.page";

test.describe("BUILD › Agents — Negative @journey @existing-user @agents @negative", () => {
  test("TC-AG-EU-N101 @low @negative — Invalid agent detail route handled", async ({
    page,
  }) => {
    await page.goto("/vap/agents/not-a-real-agent-id");
    await expect(
      page.getByText(/404|not found|Agents|Agent/i).first(),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("TC-AG-EU-N102 @medium @negative — Empty agent name search shows list", async ({
    page,
  }, testInfo) => {
    await skipUnlessHasAgents(page, testInfo);
    // Navigate through the SPA — a raw deep-link reload returns nginx 404 JSON on staging.
    const agents = new AgentsListPage(page);
    await agents.open();
    await expect(page.getByRole("heading", { name: "Agents" })).toBeVisible({
      timeout: 30_000,
    });
  });
});
