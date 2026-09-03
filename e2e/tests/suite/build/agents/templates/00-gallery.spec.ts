import { test, expect, type Page } from "@playwright/test";
import {
  AGENT_TEMPLATES,
  AgentTemplatePage,
} from "../../../../../pages/agent-template.page";
import {
  INDUSTRIES,
  TOTAL_GALLERY_AGENTS,
} from "../../../../../data/gallery-industries";
import { gotoNewAgent } from "../../../../../helpers/agent.helper";

async function hasGallery(page: Page): Promise<boolean> {
  return page
    .getByRole("heading", { name: /What industry are you building for/i })
    .isVisible({ timeout: 8_000 })
    .catch(() => false);
}

test.describe("BUILD › Agents › Template gallery @templates @smoke", () => {

  test("TC-AG-TPL-001 @smoke @high @ui — Gallery shows all 5 industry cards and Start from scratch", async ({
    page,
  }) => {
    await gotoNewAgent(page);

    test.skip(!(await hasGallery(page)), "Template gallery not enabled on this environment");

    const gallery = new AgentTemplatePage(page);
    await gallery.expectGallery();
    await gallery.expectAllTemplateCards();

    for (const industry of INDUSTRIES) {
      await expect(gallery.industryCard(industry.industry)).toBeVisible();
    }
    await expect(page.getByText(/Start from scratch/i)).toBeVisible();
  });

  test("TC-AG-TPL-004 @high @ui — Gallery count line and per-industry example counts", async ({
    page,
  }) => {
    await gotoNewAgent(page);
    test.skip(!(await hasGallery(page)), "Template gallery not enabled on this environment");

    const gallery = new AgentTemplatePage(page);
    await gallery.expectGalleryCountLine(TOTAL_GALLERY_AGENTS);
    for (const industry of INDUSTRIES) {
      await gallery.expectIndustryCount(industry.industry, industry.count);
    }
  });

  test("TC-AG-TPL-005 @high @positive — Each industry reveals its exact example agent cards", async ({
    page,
  }) => {
    await gotoNewAgent(page);
    test.skip(!(await hasGallery(page)), "Template gallery not enabled on this environment");

    const gallery = new AgentTemplatePage(page);
    await gallery.expectGallery();

    for (const industry of INDUSTRIES) {
      await gallery.selectIndustry(industry.industry);
      await gallery.expectIndustryView(industry.industry);

      for (const card of industry.agentCards) {
        await gallery.expectAgentCardVisible(card.title, card.language);
      }
      await gallery.expectAgentCardCount(industry.count);

      await gallery.goBackToIndustries();
    }
  });

  test("TC-AG-TPL-006 @medium @positive — Back to industries returns to gallery from every industry", async ({
    page,
  }) => {
    await gotoNewAgent(page);
    test.skip(!(await hasGallery(page)), "Template gallery not enabled on this environment");

    const gallery = new AgentTemplatePage(page);
    for (const industry of INDUSTRIES) {
      await gallery.selectIndustry(industry.industry);
      await gallery.backToIndustriesButton().click();
      await gallery.expectGallery();
    }
  });

  test("TC-AG-TPL-007 @medium @ui — Start from scratch card shows blank-form description", async ({
    page,
  }) => {
    await gotoNewAgent(page);
    test.skip(!(await hasGallery(page)), "Template gallery not enabled on this environment");

    await new AgentTemplatePage(page).expectStartFromScratchDescription();
  });

  test("TC-AG-TPL-008 @medium @ui — Schedule a consultation CTA with help copy", async ({
    page,
  }) => {
    await gotoNewAgent(page);
    test.skip(!(await hasGallery(page)), "Template gallery not enabled on this environment");

    await new AgentTemplatePage(page).expectScheduleConsultationCta();
  });

  for (const t of AGENT_TEMPLATES) {
    test(`TC-AG-TPL-002 @high @positive — ${t.title} card opens agent form`, async ({
      page,
    }) => {
      await gotoNewAgent(page);

      test.skip(!(await hasGallery(page)), "Template gallery not enabled on this environment");

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

    test.skip(!(await hasGallery(page)), "Template gallery not enabled on this environment");

    await new AgentTemplatePage(page).startFromScratch();
    await expect(page.getByRole("tab", { name: "Prompt" })).toBeVisible({
      timeout: 30_000,
    });
  });
});
