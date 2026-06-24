import { test, expect } from "@playwright/test";
import { openAgentFormFromScratch } from "../../../../../helpers/agent.helper";
import { AgentFormPage } from "../../../../../pages/agent-form.page";

test.describe("BUILD › Agents — Outcomes CTAs @agents @cta", () => {
  test.beforeEach(async ({ page }) => {
    const form = await openAgentFormFromScratch(page);
    await form.openTab("Outcomes");
  });

  test("CTA-AG-020 @high @cta — Customise outcomes reveals Add outcome button", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    const btn = form.customizeOutcomesButton();
    test.skip(
      !(await btn.isVisible({ timeout: 5_000 }).catch(() => false)),
      "Customise outcomes not exposed",
    );
    await form.clickCustomizeOutcomes();
    await expect(form.addOutcomeButton()).toBeVisible();
  });

  test("CTA-AG-021 @medium @cta — Add outcome adds new outcome row", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    const btn = form.customizeOutcomesButton();
    test.skip(
      !(await btn.isVisible({ timeout: 5_000 }).catch(() => false)),
      "Customise outcomes not exposed",
    );
    await form.clickCustomizeOutcomes();
    const before = await page.locator('input[placeholder*="order_placed"], input.font-mono').count();
    await form.clickAddOutcome();
    await expect(
      page.locator('input[placeholder*="order_placed"], input.font-mono'),
    ).toHaveCount(before + 1, { timeout: 10_000 });
  });
});
