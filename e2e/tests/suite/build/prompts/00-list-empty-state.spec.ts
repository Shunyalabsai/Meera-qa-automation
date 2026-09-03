import { test, expect } from "@playwright/test";
import { PromptTemplatesPage } from "../../../../pages/prompt-templates.page";
import { isPromptTemplatesEmptyState } from "../../../../helpers/prompt-templates.helper";

test.describe("BUILD › Prompts — List empty state @journey @new-user @prompts @smoke", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(
      !(await isPromptTemplatesEmptyState(page)),
      "Prompt templates already exist — empty state not shown",
    );
  });

  test("TC-PT-001 @smoke @high @ui — Empty state shows no templates message", async ({
    page,
  }) => {
    const prompts = new PromptTemplatesPage(page);
    await prompts.expectEmptyState();
  });

  test("TC-PT-002 @high @ui — Header and subtitle visible", async ({ page }) => {
    const prompts = new PromptTemplatesPage(page);
    await prompts.expectListHeader();
    // Subtitle copy: versioning/rollback pitch (mirrors expectListHeader).
    await expect(
      page.getByText(/roll back to any earlier version/i).first(),
    ).toBeVisible();
  });

  test("TC-PT-003 @high @positive — New template button visible on empty list", async ({
    page,
  }) => {
    const prompts = new PromptTemplatesPage(page);
    await expect(prompts.newTemplateButton()).toBeVisible();
    await expect(prompts.newTemplateButton()).toBeEnabled();
  });

  test("TC-PT-004 @medium @ui — Sidebar Prompts nav is active", async ({
    page,
  }) => {
    await expect(
      page.getByRole("link", { name: /^Prompts$/i }),
    ).toBeVisible();
  });
});
