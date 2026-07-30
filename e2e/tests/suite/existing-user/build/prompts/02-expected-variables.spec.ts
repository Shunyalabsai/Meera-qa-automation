import { test, expect } from "@playwright/test";
import { openPromptTemplatesList } from "../../../../../helpers/prompt-templates.helper";
import { PromptTemplatesPage } from "../../../../../pages/prompt-templates.page";
import { PROMPT_TEMPLATE_SAMPLES } from "../../../../../data/prompt-template-data";

test.describe("BUILD › Prompts — Expected variables @journey @existing-user @prompts", () => {
  test.beforeEach(async ({ page }) => {
    const prompts = await openPromptTemplatesList(page);
    await prompts.clickNewTemplate();
  });

  test("TC-PT-020 @high @positive — Add variable reveals field_name, required, description row", async ({
    page,
  }) => {
    const prompts = new PromptTemplatesPage(page);
    await prompts.addVariableButton().click();
    await prompts.expectVariableRowControls();
  });

  test("TC-PT-021 @high @positive — Fill variable row with snake_case field name", async ({
    page,
  }) => {
    const prompts = new PromptTemplatesPage(page);
    await prompts.addExpectedVariable({
      fieldName: "customer_name",
      description: "Customer first name from campaign CSV",
      required: true,
    });

    await expect(prompts.variableFieldNameInputs().last()).toHaveValue(
      "customer_name",
    );
    const cb = prompts.variableRequiredCheckboxes().last();
    if (await cb.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await expect(cb).toBeChecked();
    }
  });

  test("TC-PT-022 @medium @positive — Add multiple expected variables", async ({
    page,
  }) => {
    const prompts = new PromptTemplatesPage(page);
    await prompts.addExpectedVariable({
      fieldName: "customer_name",
      description: "Caller name",
    });
    await prompts.addExpectedVariable({
      fieldName: "order_id",
      description: "Order reference number",
      required: true,
    });

    await expect(prompts.variableFieldNameInputs()).toHaveCount(2);
    await expect(prompts.variableFieldNameInputs().nth(0)).toHaveValue(
      "customer_name",
    );
    await expect(prompts.variableFieldNameInputs().nth(1)).toHaveValue(
      "order_id",
    );
  });

  test("TC-PT-023 @medium @positive — Base prompt accepts variable placeholders", async ({
    page,
  }) => {
    const prompts = new PromptTemplatesPage(page);
    await prompts.basePromptInput().fill(
      PROMPT_TEMPLATE_SAMPLES.basePromptWithVariables,
    );
    await expect(prompts.basePromptInput()).toContainText("{customer_name}");
    await expect(prompts.basePromptInput()).toContainText("{order_id}");
  });

  test("TC-PT-024 @medium @positive — Remove variable row via delete control", async ({
    page,
  }) => {
    const prompts = new PromptTemplatesPage(page);
    await prompts.addExpectedVariable({ fieldName: "keep_field" });
    await prompts.addExpectedVariable({ fieldName: "temp_field" });
    await expect(prompts.variableFieldNameInputs()).toHaveCount(2);

    await prompts.removeLastVariable();
    await expect(prompts.variableFieldNameInputs()).toHaveCount(1);
    await expect(prompts.variableFieldNameInputs().last()).toHaveValue(
      "keep_field",
    );
  });
});
