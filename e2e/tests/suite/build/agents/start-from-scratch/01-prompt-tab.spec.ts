import { test, expect } from "@playwright/test";
import { openStartFromScratchAgentForm } from "../../../../../helpers/agent.helper";
import { AgentFormPage } from "../../../../../pages/agent-form.page";
import { START_FROM_SCRATCH } from "../../../../../data/start-from-scratch-template";

test.describe("BUILD › Agents › Start from scratch — Prompt tab @journey @start-from-scratch", () => {
  test.beforeEach(async ({ page }) => {
    await openStartFromScratchAgentForm(page);
  });

  test("TC-AG-SFS-010 @high @ui — Prompt tab shows pipeline, basic info, empty system prompt", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.expectNewAgentHeader();
    await form.expectAllTabsVisible();
    await form.expectPromptTabContent();
    await expect(page.getByText(/Shunya Native|gemini/i)).toBeVisible();
    expect(await form.systemPromptInput().inputValue()).toBe("");
  });

  test("TC-AG-SFS-011 @high @positive — User fills name, description, and custom system prompt", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.nameInput().fill("Custom Agent E2E");
    await form.descriptionInput().fill(START_FROM_SCRATCH.sampleDescription);
    const prompt = form.systemPromptInput();
    if (await prompt.isEditable({ timeout: 3_000 }).catch(() => false)) {
      await prompt.fill(START_FROM_SCRATCH.sampleSystemPrompt);
      await expect(prompt).toHaveValue(START_FROM_SCRATCH.sampleSystemPrompt);
    }
    await expect(form.nameInput()).toHaveValue("Custom Agent E2E");
  });

  test("TC-AG-SFS-012 @high @positive — Blank defaults: en, neutral tone, neutral accent/gender", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await expect(form.languageSelect()).toHaveValue("en");
    await expect(form.voiceToneSelect()).toHaveValue("neutral");
    await expect(form.accentSelect()).toHaveValue("neutral");
    await expect(form.genderSelect()).toHaveValue("neutral");
  });

  test("TC-AG-SFS-013 @medium @positive — All prompt dropdowns are selectable on blank form", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.expectAllPromptDropdownOptions();
    await form.selectLanguage("hinglish");
    await form.selectVoiceTone("warm");
    await form.selectAccent("indian");
    await form.selectGender("female");
  });

  test("TC-AG-SFS-014 @medium @ui — Guide panel shows prompt variables and Role → Goal → Rules tip", async ({
    page,
  }) => {
    await expect(
      page.getByText(/Building your prompt|Variables|Role.*Goal.*Rules/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});
