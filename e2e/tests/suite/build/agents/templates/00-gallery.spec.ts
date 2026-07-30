import { test, expect } from "@playwright/test";
import {
  AGENT_TEMPLATES,
  AgentTemplatePage,
} from "../../../../../pages/agent-template.page";
import { gotoNewAgent } from "../../../../../helpers/agent.helper";

const INDUSTRIES = ["BFSI", "Ecommerce", "Healthcare", "Logistics", "Telecom"];

test.describe("BUILD › Agents › Template gallery @templates", () => {
  test("TC-AG-TPL-001 @high @ui — Gallery shows all 5 industry cards and Start from scratch", async ({
    page,
  }) => {
    await gotoNewAgent(page);

    const hasGallery = await page
      .getByRole("heading", { name: /What industry are you building for/i })
      .isVisible({ timeout: 8_000 })
      .catch(() => false);

    test.skip(!hasGallery, "Template gallery not enabled on this environment");

    const gallery = new AgentTemplatePage(page);
    await gallery.expectGallery();
    await gallery.expectAllTemplateCards();

    for (const industry of INDUSTRIES) {
      await expect(gallery.industryCard(industry)).toBeVisible();
    }
    await expect(page.getByText(/Start from scratch/i)).toBeVisible();
  });

  for (const t of AGENT_TEMPLATES) {
    test(`TC-AG-TPL-002 @high @positive — ${t.title} card opens agent form`, async ({
      page,
    }) => {
      await gotoNewAgent(page);

      const hasGallery = await page
        .getByRole("heading", { name: /What industry are you building for/i })
        .isVisible({ timeout: 8_000 })
        .catch(() => false);

      test.skip(!hasGallery, "Template gallery not enabled on this environment");

      await new AgentTemplatePage(page).selectTemplate(t.title);
      await expect(page.getByRole("tab", { name: "Prompt" })).toBeVisible({
        timeout: 30_000,
      });
    });
  }

  test("TC-AG-TPL-003 @medium @positive — Start from scratch opens blank form", async ({
    page,
  }) => {
    await gotoNewAgent(page);

    const hasGallery = await page
      .getByRole("heading", { name: /What industry are you building for/i })
      .isVisible({ timeout: 8_000 })
      .catch(() => false);

    test.skip(!hasGallery, "Template gallery not enabled on this environment");

    await new AgentTemplatePage(page).startFromScratch();
    await expect(page.getByRole("tab", { name: "Prompt" })).toBeVisible({
      timeout: 30_000,
    });
  });
});
