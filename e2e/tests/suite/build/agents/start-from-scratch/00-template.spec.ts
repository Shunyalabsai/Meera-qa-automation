import { test, expect } from "@playwright/test";
import {
  openStartFromScratchAgentForm,
  gotoNewAgent,
} from "../../../../../helpers/agent.helper";
import { START_FROM_SCRATCH } from "../../../../../data/start-from-scratch-template";
import { AgentFormPage } from "../../../../../pages/agent-form.page";
import { AgentTemplatePage } from "../../../../../pages/agent-template.page";

test.describe("BUILD › Agents › Start from scratch — Gallery entry @journey @start-from-scratch", () => {
  test("TC-AG-SFS-001 @smoke @high @positive — Start from scratch opens blank form with neutral defaults", async ({
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
    await expect(
      page.getByRole("button", { name: /Start from scratch/i }),
    ).toBeVisible();

    await gallery.startFromScratch();

    const form = new AgentFormPage(page);
    await form.ensureFormReady();
    await form.expectNewAgentHeader();
    await form.expectPromptTabContent();

    expect(await form.nameInput().inputValue()).toBe("");
    await form.expectDropdownSelected(
      form.languageSelect(),
      START_FROM_SCRATCH.expectedLanguage,
    );
    await form.expectDropdownSelected(
      form.voiceToneSelect(),
      START_FROM_SCRATCH.expectedVoiceTone,
    );
    await form.expectDropdownSelected(
      form.accentSelect(),
      START_FROM_SCRATCH.expectedAccent,
    );
    await form.expectDropdownSelected(
      form.genderSelect(),
      START_FROM_SCRATCH.expectedGender,
    );
    await form.expectDropdownSelected(
      form.callDirectionSelect(),
      START_FROM_SCRATCH.defaultCallDirection,
    );

    const prompt = await form.systemPromptInput().inputValue();
    expect(prompt.trim()).toBe("");
  });

  test("TC-AG-SFS-002 @medium @positive — Change template returns to gallery", async ({
    page,
  }) => {
    await openStartFromScratchAgentForm(page);
    const form = new AgentFormPage(page);
    await form.changeTemplateButton().click();
    await new AgentTemplatePage(page).expectGallery();
  });
});
