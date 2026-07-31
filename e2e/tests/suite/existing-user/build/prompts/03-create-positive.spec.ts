import { test } from "@playwright/test";
import {
  createPromptTemplate,
  openPromptTemplatesList,
} from "../../../../../helpers/prompt-templates.helper";
import { PROMPT_TEMPLATE_SAMPLES } from "../../../../../data/prompt-template-data";
import { uniqueName } from "../../../../../utils/test-data";

test.describe("BUILD › Prompts — Create positive @journey @existing-user @prompts", () => {
  test("TC-PT-030 @high @positive — Create template with name, category, and base prompt", async ({
    page,
  }) => {
    const name = uniqueName("welcome-flow");
    await createPromptTemplate(page, {
      name,
      category: "support",
      description: PROMPT_TEMPLATE_SAMPLES.description,
      basePrompt: PROMPT_TEMPLATE_SAMPLES.basePrompt,
    });

    const prompts = await openPromptTemplatesList(page);
    await prompts.expectTemplateVisible(name);
  });

  test("TC-PT-031 @high @positive — Create template with expected variables", async ({
    page,
  }) => {
    const name = uniqueName("order-support");
    await createPromptTemplate(page, {
      name,
      basePrompt: PROMPT_TEMPLATE_SAMPLES.basePromptWithVariables,
      variables: [
        {
          fieldName: "customer_name",
          description: "Customer name from CSV",
          required: true,
        },
        {
          fieldName: "order_id",
          description: "Order reference",
        },
      ],
    });

    const prompts = await openPromptTemplatesList(page);
    await prompts.expectTemplateVisible(name);
  });
});
