import { test } from "@playwright/test";
import {
  createPromptTemplate,
  openPromptTemplatesList,
} from "../../../../helpers/prompt-templates.helper";
import { PROMPT_TEMPLATE_SAMPLES } from "../../../../data/prompt-template-data";
import { uniqueName } from "../../../../utils/test-data";

test.describe("BUILD › Prompts — Lifecycle @journey @new-user @prompts @serial", () => {
  test.describe.configure({ mode: "serial" });

  const templateName = uniqueName("lifecycle_prompt");

  test("TC-PT-040 @high @positive — Create prompt template with variables", async ({
    page,
  }) => {
    await createPromptTemplate(page, {
      name: templateName,
      category: "support",
      description: "Lifecycle E2E prompt template",
      basePrompt: PROMPT_TEMPLATE_SAMPLES.basePromptWithVariables,
      variables: [
        {
          fieldName: "customer_name",
          description: "Customer name",
          required: true,
        },
        { fieldName: "order_id", description: "Order ID" },
      ],
    });
  });

  test("TC-PT-041 @high @positive — Template appears in list", async ({
    page,
  }) => {
    const prompts = await openPromptTemplatesList(page);
    await prompts.expectTemplateVisible(templateName);
  });

  test("TC-PT-042 @medium @positive — New template form opens from populated list", async ({
    page,
  }) => {
    const prompts = await openPromptTemplatesList(page);
    await prompts.newTemplateButton().click();
    await prompts.expectCreateForm();
  });

  test("TC-PT-043 @high @positive — Delete lifecycle template if supported", async ({
    page,
  }) => {
    const prompts = await openPromptTemplatesList(page);
    await prompts.expectTemplateVisible(templateName);

    const deleteBtn = prompts
      .templateRow(templateName)
      .getByRole("button", { name: /Delete/i });
    if (!(await deleteBtn.isVisible({ timeout: 3_000 }).catch(() => false))) {
      test.skip(true, "Delete action not exposed in UI");
    }

    await prompts.deleteTemplate(templateName);
  });
});
