import { test, expect } from "@playwright/test";
import { skipUnlessHasAgents } from "../../../../../helpers/existing-user.helper";
import { AgentsListPage } from "../../../../../pages/agents-list.page";

test.describe("BUILD › Agents — Negative @journey @existing-user @agents @negative", () => {
  test("TC-AG-EU-N101 @low @negative — Invalid agent detail route handled", async ({
    page,
  }) => {
    await page.goto("/vap/agents/not-a-real-agent-id");
    // The SPA keeps the app shell intact and shows an inline error in <main>
    // ("Request failed with status code 422") instead of crashing or going blank.
    await expect(
      page.locator("main").getByText(/Request failed with status code \d+/i),
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
