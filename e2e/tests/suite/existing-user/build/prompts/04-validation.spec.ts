import { test, expect } from "@playwright/test";
import { openPromptTemplatesList } from "../../../../../helpers/prompt-templates.helper";
import { PromptTemplatesPage } from "../../../../../pages/prompt-templates.page";
import { PROMPT_TEMPLATE_SAMPLES } from "../../../../../data/prompt-template-data";
import { uniqueName, XSS_PAYLOAD } from "../../../../../utils/test-data";

test.describe("BUILD › Prompts — Validation @journey @existing-user @negative @edge @prompts", () => {
  test.beforeEach(async ({ page }) => {
    const prompts = await openPromptTemplatesList(page);
    await prompts.clickNewTemplate();
  });

  test("TC-PT-N101 @high @negative — Empty name blocked on create", async ({
    page,
  }) => {
    const prompts = new PromptTemplatesPage(page);
    await prompts.nameInput().clear();
    await prompts.basePromptInput().fill(PROMPT_TEMPLATE_SAMPLES.basePrompt);
    await prompts.submitCreate();

    const nameInput = prompts.nameInput();
    const invalid =
      (await nameInput.evaluate((el: HTMLInputElement) => !el.checkValidity()).catch(
        () => false,
      )) ||
      (await page.getByText(/required|Fix the highlighted|fill in this field/i).isVisible({ timeout: 3_000 }).catch(() => false));

    expect(invalid).toBe(true);
    await prompts.expectCreateBlocked();
  });

  test("TC-PT-N102 @high @negative — Empty base prompt blocked on create", async ({
    page,
  }) => {
    const prompts = new PromptTemplatesPage(page);
    await prompts.nameInput().fill(uniqueName("no-prompt"));
    await prompts.basePromptInput().clear();
    await prompts.submitCreate();

    const promptInput = prompts.basePromptInput();
    const invalid =
      (await promptInput.evaluate((el: HTMLTextAreaElement) => !el.checkValidity()).catch(
        () => false,
      )) ||
      (await page.getByText(/required|Fix the highlighted|fill in this field/i).isVisible({ timeout: 3_000 }).catch(() => false));

    expect(invalid).toBe(true);
    await prompts.expectCreateBlocked();
  });

  test("TC-PT-N103 @medium @negative — Whitespace-only name blocked", async ({
    page,
  }) => {
    const prompts = new PromptTemplatesPage(page);
    await prompts.nameInput().fill("   ");
    await prompts.basePromptInput().fill(PROMPT_TEMPLATE_SAMPLES.basePrompt);
    await prompts.submitCreate();
    await prompts.expectCreateBlocked();
  });

  test("TC-PT-N104 @medium @edge — Unicode and emoji accepted in base prompt", async ({
    page,
  }) => {
    const prompts = new PromptTemplatesPage(page);
    const unicodePrompt = "आपका स्वागत है 👋 Be helpful and respectful.";
    await prompts.nameInput().fill(uniqueName("unicode-prompt"));
    await prompts.basePromptInput().fill(unicodePrompt);
    await expect(prompts.basePromptInput()).toHaveValue(unicodePrompt);
  });

  test("TC-PT-N105 @high @edge — XSS in name does not execute", async ({
    page,
  }) => {
    const prompts = new PromptTemplatesPage(page);
    let dialogFired = false;
    page.on("dialog", () => {
      dialogFired = true;
    });
    await prompts.nameInput().fill(`${uniqueName("xss")}_${XSS_PAYLOAD}`);
    await prompts.basePromptInput().fill(PROMPT_TEMPLATE_SAMPLES.basePrompt);
    await prompts.submitCreate();
    await page.waitForTimeout(2_000);
    expect(dialogFired).toBe(false);
  });
});
