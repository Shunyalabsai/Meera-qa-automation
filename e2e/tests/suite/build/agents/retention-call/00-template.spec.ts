import { test, expect } from "@playwright/test";
import {
  openRetentionCallAgentForm,
  gotoNewAgent,
} from "../../../../../helpers/agent.helper";
import { RETENTION_CALL_TEMPLATE } from "../../../../../data/retention-call-template";
import { AgentFormPage } from "../../../../../pages/agent-form.page";
import { AgentTemplatePage } from "../../../../../pages/agent-template.page";

test.describe("BUILD › Agents › Retention Call — Template @journey @retention-call", () => {
  test("TC-AG-CS-001 @smoke @high @positive — Retention Call card opens pre-filled form", async ({
    page,
  }) => {
    await gotoNewAgent(page);

    const hasGallery = await page
      .getByRole("heading", { name: /What industry are you building for/i })
      .isVisible({ timeout: 8_000 })
      .catch(() => false);

    test.skip(!hasGallery, "Template gallery not enabled on this environment");

    const gallery = new AgentTemplatePage(page);
    await gallery.expectGallery();
    await gallery.selectTemplate(RETENTION_CALL_TEMPLATE.cardTitle);

    const form = new AgentFormPage(page);
    await form.ensureFormReady();
    await form.expectNewAgentHeader();
    await form.expectPromptTabContent();

    expect(await form.nameInput().inputValue()).toMatch(
      RETENTION_CALL_TEMPLATE.expectedName,
    );
    await form.expectDropdownSelected(
      form.languageSelect(),
      RETENTION_CALL_TEMPLATE.expectedLanguage,
    );
    await form.expectDropdownSelected(
      form.voiceToneSelect(),
      RETENTION_CALL_TEMPLATE.expectedVoiceTone,
    );
    await form.expectDropdownSelected(
      form.accentSelect(),
      RETENTION_CALL_TEMPLATE.expectedAccent,
    );
    await form.expectDropdownSelected(
      form.genderSelect(),
      RETENTION_CALL_TEMPLATE.expectedGender,
    );
    await form.expectDropdownSelected(
      form.callDirectionSelect(),
      RETENTION_CALL_TEMPLATE.defaultCallDirection,
    );

    const prompt = await form.systemPromptInput().inputValue();
    expect(prompt).toMatch(
      RETENTION_CALL_TEMPLATE.expectedSystemPromptSnippet,
    );
  });

  test("TC-AG-CS-002 @medium @positive — Change template returns to Telecom industry view", async ({
    page,
  }) => {
    await openRetentionCallAgentForm(page);
    const form = new AgentFormPage(page);
    await form.changeTemplateButton().click();
    await new AgentTemplatePage(page).expectIndustryView("Telecom");
  });
});
