import { Page, expect } from "@playwright/test";
import { PromptTemplatesPage } from "../pages/prompt-templates.page";
import { PROMPT_TEMPLATE_SAMPLES } from "../data/prompt-template-data";
import type { ExpectedVariableInput } from "../data/prompt-template-data";

export type CreatePromptTemplateInput = {
  name: string;
  category?: string;
  description?: string;
  basePrompt?: string;
  variables?: ExpectedVariableInput[];
};

export async function openPromptTemplatesList(
  page: Page,
): Promise<PromptTemplatesPage> {
  const prompts = new PromptTemplatesPage(page);
  await prompts.open();
  return prompts;
}

export async function isPromptTemplatesEmptyState(page: Page): Promise<boolean> {
  const prompts = new PromptTemplatesPage(page);
  await prompts.open();
  return prompts.isEmptyState();
}

export async function openPromptCreateForm(
  page: Page,
): Promise<PromptTemplatesPage> {
  const prompts = await openPromptTemplatesList(page);
  if (await prompts.isEmptyState()) {
    await prompts.clickNewTemplate();
  } else {
    await prompts.newTemplateButton().click();
    await prompts.expectCreateForm();
  }
  return prompts;
}

export async function createPromptTemplate(
  page: Page,
  input: CreatePromptTemplateInput,
): Promise<void> {
  const prompts = new PromptTemplatesPage(page);
  await prompts.open();

  if (await prompts.isEmptyState()) {
    await prompts.clickNewTemplate();
  } else {
    await prompts.newTemplateButton().click();
    await prompts.expectCreateForm();
  }

  await prompts.fillCreateForm({
    name: input.name,
    category: input.category ?? PROMPT_TEMPLATE_SAMPLES.category,
    description: input.description ?? PROMPT_TEMPLATE_SAMPLES.description,
    basePrompt: input.basePrompt ?? PROMPT_TEMPLATE_SAMPLES.basePrompt,
    variables: input.variables,
  });

  await prompts.submitCreate();
  await expect(page.getByText(input.name, { exact: false })).toBeVisible({
    timeout: 45_000,
  });
}
