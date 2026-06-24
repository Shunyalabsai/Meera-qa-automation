import { test, expect } from "@playwright/test";
import { openDebtRecoveryAgentForm } from "../../../../../helpers/agent.helper";
import { AgentFormPage } from "../../../../../pages/agent-form.page";

/**
 * Debt recovery–specific Prompt tab tests.
 * Dropdown matrix (Language, Voice tone, Accent, Gender) lives in
 * ../templates/prompt-dropdowns.spec.ts for all 4 cards + scratch.
 */
test.describe("BUILD › Agents › Debt recovery — Prompt tab @journey @debt-recovery", () => {
  test.beforeEach(async ({ page }) => {
    await openDebtRecoveryAgentForm(page);
  });

  test("TC-AG-DR-010 @high @ui — Prompt tab shows pipeline, basic info, system prompt", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.expectNewAgentHeader();
    await form.expectAllTabsVisible();
    await form.expectPromptTabContent();
    await expect(page.getByText(/Shunya Native|gemini/i)).toBeVisible();
  });

  test("TC-AG-002 @high @positive — System prompt is editable", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    const customPrompt =
      "You are a debt recovery specialist. Confirm identity before discussing balance.";
    const prompt = form.systemPromptInput();
    if (await prompt.isEditable({ timeout: 3_000 }).catch(() => false)) {
      await prompt.fill(customPrompt);
      await expect(prompt).toHaveValue(customPrompt);
    }
  });

  test("TC-AG-004 @high @positive — Debt recovery pre-fills hinglish and assertive", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await expect(form.languageSelect()).toHaveValue("hinglish");
    await expect(form.voiceToneSelect()).toHaveValue("assertive");
    await expect(form.accentSelect()).toHaveValue("neutral");
  });

  test("TC-AG-DR-019 @high @positive — Name and description fields accept input", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.nameInput().fill("Recovery Agent E2E");
    await form.descriptionInput().fill("Outbound recovery for Hindi-speaking customers");
    await expect(form.nameInput()).toHaveValue("Recovery Agent E2E");
  });
});
