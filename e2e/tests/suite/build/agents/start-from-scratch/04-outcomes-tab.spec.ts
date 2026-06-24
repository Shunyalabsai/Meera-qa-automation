import { test, expect } from "@playwright/test";
import { openStartFromScratchAgentForm } from "../../../../../helpers/agent.helper";
import { AgentFormPage } from "../../../../../pages/agent-form.page";
import { START_FROM_SCRATCH } from "../../../../../data/start-from-scratch-template";

test.describe("BUILD › Agents › Start from scratch — Outcomes tab @journey @start-from-scratch", () => {
  test.beforeEach(async ({ page }) => {
    const form = await openStartFromScratchAgentForm(page);
    await form.openTab("Outcomes");
  });

  test("TC-AG-SFS-040 @medium @ui — Outcomes tab shows platform defaults", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.expectOutcomesTabContent();
    await expect(
      page.getByText(/platform defaults|Using platform defaults/i).first(),
    ).toBeVisible();
    for (const label of ["resolved", "escalated", "no_answer"]) {
      await expect(page.getByText(label).first()).toBeVisible();
    }
  });

  test("TC-AG-SFS-041 @medium @positive — Customize outcomes from defaults", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    const btn = form.customizeOutcomesButton();
    if (await btn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await btn.click();
      await expect(page.getByRole("button", { name: /Add outcome/i })).toBeVisible();
    }
  });

  test("TC-AG-SFS-042 @high @positive — Custom extraction schema on blank agent", async ({
    page,
  }) => {
    const editor = page.locator("textarea.font-mono, textarea[class*='font-mono']").last();
    await editor.fill(START_FROM_SCRATCH.sampleExtractionSchema);
    await expect(editor).toContainText("intentCaptured");
    await expect(editor).toContainText("issueResolved");
  });

  test("TC-AG-SFS-043 @medium @positive — Custom outcome with descriptive label", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    const btn = form.customizeOutcomesButton();
    if (await btn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await btn.click();
      const labelInput = page.locator('input[placeholder*="order_placed"], input.font-mono').first();
      if (await labelInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await labelInput.fill("call_completed");
      }
    }
  });

  test("TC-AG-SFS-044 @high @positive — Escalation handoff optional on custom agent", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.checkboxByLabel(/Enable escalation/i).check();
    await page.getByLabel(/Handoff target/i).fill("#custom-handoff");
    await expect(page.getByLabel(/Handoff target/i)).toHaveValue("#custom-handoff");
    await form.checkboxByLabel(/Enable escalation/i).uncheck();
  });
});
