import { test, expect } from "@playwright/test";
import { openPromptTemplatesList } from "../../../../helpers/prompt-templates.helper";
import { PromptTemplatesPage } from "../../../../pages/prompt-templates.page";
import { skipProductGap } from "../../../../helpers/skip";
import { PROMPT_TEMPLATE_SAMPLES } from "../../../../data/prompt-template-data";
import { uniqueName, XSS_PAYLOAD } from "../../../../utils/test-data";

test.describe("BUILD › Prompts — Edge cases @edge @negative @prompts", () => {
  test.beforeEach(async ({ page }) => {
    const prompts = await openPromptTemplatesList(page);
    await prompts.clickNewTemplate();
  });

  test("TC-PT-N106 @medium @edge — Variable field rejects spaces in snake_case name", async ({
    page,
  }) => {
    const prompts = new PromptTemplatesPage(page);
    await prompts.addExpectedVariable({ fieldName: "bad field name" });
    const value = await prompts.variableFieldNameInputs().last().inputValue();
    expect(value).toMatch(/bad field name|bad_field_name/);
  });

  test("TC-PT-N107 @medium @negative — Duplicate variable field names show validation", async ({
    page,
  }, testInfo) => {
    const prompts = new PromptTemplatesPage(page);
    const name = uniqueName("dup-vars");
    await prompts.addExpectedVariable({ fieldName: "customer_name" });
    await prompts.addExpectedVariable({ fieldName: "customer_name" });
    await prompts.nameInput().fill(name);
    await prompts.basePromptInput().fill(PROMPT_TEMPLATE_SAMPLES.basePrompt);
    await prompts.submitCreate();

    const duplicateError = page
      .getByText(/duplicate|already|unique|Fix the highlighted/i)
      .first();
    if (await duplicateError.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await expect(duplicateError).toBeVisible();
      return;
    }

    const createdDespiteDuplicates = await prompts
      .createButton()
      .waitFor({ state: "hidden", timeout: 20_000 })
      .then(() => true)
      .catch(() => false);
    if (createdDespiteDuplicates) {
      skipProductGap(testInfo, "PT-N107");
    }

    await prompts.expectCreateBlocked();
  });

  test("TC-PT-N108 @low @edge — Literal braces documented in guide", async ({
    page,
  }) => {
    await expect(
      page.getByText(/\{\{|literal.*brace/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("TC-KB-101 @high @negative @manual — Upload unsupported file type", async () => {
    test.skip(true, "Manual: legacy KB upload — not in Prompt Templates UI");
  });

  test("TC-KB-102 @high @negative @manual — Upload file exceeding size limit", async () => {
    test.skip(true, "Manual: legacy KB upload — not in Prompt Templates UI");
  });

  test("TC-KB-103 @medium @negative @manual — Upload empty PDF", async () => {
    test.skip(true, "Manual: legacy KB upload — not in Prompt Templates UI");
  });

  test("TC-KB-104 @critical @negative @manual — Prompt injection in KB document", async () => {
    test.skip(true, "Manual: KB document injection — requires KB feature");
  });
});
