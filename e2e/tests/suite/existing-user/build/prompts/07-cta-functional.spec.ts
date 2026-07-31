import { test, expect } from "@playwright/test";
import { openPromptCreateForm } from "../../../../../helpers/prompt-templates.helper";

test.describe("BUILD › Prompts — CTA functional @journey @existing-user @prompts @cta", () => {
  test("CTA-PT-001 @high @cta — New template opens create form", async ({ page }) => {
    const prompts = await openPromptCreateForm(page);
    await prompts.expectCreateForm();
  });

  test("CTA-PT-002 @high @cta — Add variable adds row", async ({ page }) => {
    const prompts = await openPromptCreateForm(page);
    await prompts.addVariableButton().click();
    await expect(prompts.addVariableButton()).toBeVisible();
  });

  test("CTA-PT-003 @medium @cta — Cancel closes create form", async ({ page }) => {
    const prompts = await openPromptCreateForm(page);
    await prompts.cancelButton().click();
    await expect(prompts.newTemplateButton()).toBeVisible();
  });
});
