import { test } from "@playwright/test";
import { openPromptTemplatesList } from "../../../../../helpers/prompt-templates.helper";
import { skipUnlessHasPromptTemplates } from "../../../../../helpers/existing-user.helper";

test.describe("BUILD › Prompts — Populated @journey @existing-user @prompts @ui", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await skipUnlessHasPromptTemplates(page, testInfo);
  });

  test("TC-PT-EU-001 @high @ui — Prompt templates list not empty", async ({
    page,
  }) => {
    const prompts = await openPromptTemplatesList(page);
    await prompts.expectPopulatedList();
  });
});
