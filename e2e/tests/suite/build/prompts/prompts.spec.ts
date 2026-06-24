import { test } from "@playwright/test";
import { PromptTemplatesPage } from "../../../../pages/prompt-templates.page";

test.describe("BUILD › Prompts @smoke", () => {
  test("TC-KB-001 @high @positive — Prompt Templates page loads", async ({
    page,
  }) => {
    const prompts = new PromptTemplatesPage(page);
    await prompts.open();
  });
});
