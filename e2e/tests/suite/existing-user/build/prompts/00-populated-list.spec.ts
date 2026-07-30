import { test, expect } from "@playwright/test";
import { openPromptTemplatesList } from "../../../../../helpers/prompt-templates.helper";
import { skipUnlessHasPromptTemplates } from "../../../../../helpers/existing-user.helper";

test.describe("BUILD › Prompts — Populated list @journey @existing-user @prompts @ui", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await skipUnlessHasPromptTemplates(page, testInfo);
  });

  test("TC-PT-EU-001 @high @ui — Template list header visible", async ({ page }) => {
    const prompts = await openPromptTemplatesList(page);
    await prompts.expectListHeader();
  });

  test("TC-PT-EU-002 @high @ui — New template button visible on populated list", async ({
    page,
  }) => {
    const prompts = await openPromptTemplatesList(page);
    await expect(prompts.newTemplateButton()).toBeVisible();
    await expect(prompts.newTemplateButton()).toBeEnabled();
  });

  test("TC-PT-EU-003 @medium @ui — Sidebar Prompts nav link visible", async ({
    page,
  }) => {
    await openPromptTemplatesList(page);
    await expect(page.getByRole("link", { name: /^Prompts$/i })).toBeVisible();
  });
});
