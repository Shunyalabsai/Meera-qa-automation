import { test, expect } from "@playwright/test";
import { openPromptTemplatesList } from "../../../../helpers/prompt-templates.helper";
import { PromptTemplatesPage } from "../../../../pages/prompt-templates.page";
import { PROMPT_TEMPLATE_SAMPLES } from "../../../../data/prompt-template-data";

test.describe("BUILD › Prompts — Create form UI @journey @new-user @prompts", () => {
  test("TC-PT-010 @high @ui — New template opens create form with required fields", async ({
    page,
  }) => {
    const prompts = await openPromptTemplatesList(page);
    await prompts.clickNewTemplate();

    await expect(prompts.nameInput()).toBeVisible();
    await expect(prompts.categoryInput()).toBeVisible();
    await expect(prompts.basePromptInput()).toBeVisible();
    await expect(prompts.createButton()).toBeVisible();
    await expect(prompts.cancelButton()).toBeVisible();
  });

  test("TC-PT-011 @high @ui — Variable reference guide explains single-brace syntax", async ({
    page,
  }) => {
    const prompts = await openPromptTemplatesList(page);
    await prompts.clickNewTemplate();
    await prompts.expectVariableGuide();
  });

  test("TC-PT-012 @high @ui — Expected variables section with Add variable button", async ({
    page,
  }) => {
    const prompts = await openPromptTemplatesList(page);
    await prompts.clickNewTemplate();
    await prompts.expectExpectedVariablesSection();
  });

  test("TC-PT-013 @medium @positive — All form fields accept input", async ({
    page,
  }) => {
    const prompts = await openPromptTemplatesList(page);
    await prompts.clickNewTemplate();

    await prompts.nameInput().fill("support-greeting");
    await prompts.categoryInput().fill("support");
    const desc = prompts.descriptionInput();
    if (await desc.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await desc.fill(PROMPT_TEMPLATE_SAMPLES.description);
    }
    await prompts.basePromptInput().fill(PROMPT_TEMPLATE_SAMPLES.basePrompt);

    await expect(prompts.nameInput()).toHaveValue("support-greeting");
    await expect(prompts.basePromptInput()).toHaveValue(
      PROMPT_TEMPLATE_SAMPLES.basePrompt,
    );
  });

  test("TC-PT-014 @medium @positive — Cancel returns to list without creating", async ({
    page,
  }) => {
    const prompts = await openPromptTemplatesList(page);
    await prompts.clickNewTemplate();
    await prompts.nameInput().fill("should-not-be-created");
    await prompts.cancelCreate();
    await prompts.expectListHeader();
    await expect(page.getByText("should-not-be-created")).not.toBeVisible({
      timeout: 3_000,
    });
  });
});
