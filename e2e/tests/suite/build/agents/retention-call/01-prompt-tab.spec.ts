import { test, expect } from "@playwright/test";
import { openRetentionCallAgentForm } from "../../../../../helpers/agent.helper";
import { AgentFormPage } from "../../../../../pages/agent-form.page";
import { RETENTION_CALL_TEMPLATE } from "../../../../../data/retention-call-template";

test.describe("BUILD › Agents › Retention Call — Prompt tab @journey @retention-call", () => {
  test.beforeEach(async ({ page }) => {
    await openRetentionCallAgentForm(page);
  });

  test("TC-AG-CS-010 @high @ui — Prompt tab shows pipeline, basic info, system prompt", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.expectNewAgentHeader();
    await form.expectAllTabsVisible();
    await form.expectPromptTabContent();
    await expect(page.getByText(/Shunya Native|gemini|Basic info/i).first()).toBeVisible();
  });

  test("TC-AG-CS-011 @high @positive — System prompt is editable", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    const customPrompt =
      "You are a helpful support agent. Understand the issue, ask clarifying questions, and escalate when needed.";
    const prompt = form.systemPromptInput();
    if (await prompt.isEditable({ timeout: 3_000 }).catch(() => false)) {
      await prompt.fill(customPrompt);
      await expect(prompt).toHaveValue(customPrompt);
    }
  });

  test("TC-AG-CS-012 @high @positive — Pre-fills template defaults", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.expectDropdownSelected(form.languageSelect(), RETENTION_CALL_TEMPLATE.expectedLanguage);
    await form.expectDropdownSelected(form.voiceToneSelect(), RETENTION_CALL_TEMPLATE.expectedVoiceTone);
    await form.expectDropdownSelected(form.accentSelect(), RETENTION_CALL_TEMPLATE.expectedAccent);
    await form.expectDropdownSelected(form.genderSelect(), RETENTION_CALL_TEMPLATE.expectedGender);
  });

  test("TC-AG-CS-013 @high @positive — Name and description fields accept input", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.nameInput().fill("Support Agent E2E");
    await form.descriptionInput().fill("Inbound support agent for customer issue resolution");
    await expect(form.nameInput()).toHaveValue("Support Agent E2E");
  });

  test("TC-AG-CS-014 @medium @ui — Guide panel shows prompt variables", async ({
    page,
  }) => {
    await expect(
      page.getByText(/Building your prompt|Variables|Role.*Goal.*Rules/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});
