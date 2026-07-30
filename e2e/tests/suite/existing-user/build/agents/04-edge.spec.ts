import { test, expect } from "@playwright/test";
import { AgentsListPage } from "../../../../../pages/agents-list.page";
import { skipUnlessHasAgents } from "../../../../../helpers/existing-user.helper";
import { reloadSpaRoute } from "../../../../../helpers/navigate";

test.describe("BUILD › Agents — Edge @journey @existing-user @agents @edge", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await skipUnlessHasAgents(page, testInfo);
  });

  test("TC-AG-EU-E101 @medium @edge — Reload preserves agent list", async ({
    page,
  }) => {
    const agents = new AgentsListPage(page);
    await agents.open();
    const count = await agents.agentListItems().count();
    await reloadSpaRoute(page, "agents");
    await agents.expectListLoaded();
    await expect
      .poll(async () => agents.agentListItems().count(), { timeout: 20_000 })
      .toBe(count);
  });

  test("TC-AG-EU-E102 @medium @edge — Navigate to Playground and back", async ({
    page,
  }) => {
    const agents = new AgentsListPage(page);
    await agents.open();
    await page.getByRole("link", { name: /^Playground$/i }).click();
    await expect(page).toHaveURL(/playground/, { timeout: 30_000 });
    await page.getByRole("link", { name: /^Agents$/i }).click();
    expect(await agents.agentListItems().count()).toBeGreaterThan(0);
  });
});
