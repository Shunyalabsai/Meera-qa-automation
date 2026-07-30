import { test, expect } from "@playwright/test";
import { openDebtRecoveryAgentForm, gotoNewAgent } from "../../../../../helpers/agent.helper";
import { DEBT_RECOVERY_TEMPLATE } from "../../../../../data/debt-recovery-template";
import { AgentFormPage } from "../../../../../pages/agent-form.page";
import { AgentTemplatePage } from "../../../../../pages/agent-template.page";

test.describe("BUILD › Agents › Debt recovery — Template @journey @debt-recovery", () => {
  test("TC-AG-DR-001 @high @positive — Debt recovery card opens pre-filled form", async ({
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
    await expect(
      page.getByText(DEBT_RECOVERY_TEMPLATE.cardTitle, { exact: false }),
    ).toBeVisible();
    await gallery.selectTemplate(DEBT_RECOVERY_TEMPLATE.cardTitle);

    const form = new AgentFormPage(page);
    await form.ensureFormReady();
    await form.expectNewAgentHeader();
    await form.expectPromptTabContent();

    const name = await form.nameInput().inputValue();
    expect(name).toMatch(DEBT_RECOVERY_TEMPLATE.expectedName);

    await expect(form.languageSelect()).toHaveValue(
      DEBT_RECOVERY_TEMPLATE.expectedLanguage,
    );
    await expect(form.voiceToneSelect()).toHaveValue(
      DEBT_RECOVERY_TEMPLATE.expectedVoiceTone,
    );

    const prompt = await form.systemPromptInput().inputValue();
    expect(prompt).toMatch(DEBT_RECOVERY_TEMPLATE.expectedSystemPromptSnippet);
  });

  test("TC-AG-DR-002 @medium @positive — Change template link returns to gallery", async ({
    page,
  }) => {
    await openDebtRecoveryAgentForm(page);

    const changeLink = page.getByRole("link", { name: /Change template/i });
    test.skip(
      !(await changeLink.isVisible({ timeout: 3_000 }).catch(() => false)),
      "Change template link not present",
    );

    await changeLink.click();
    await new AgentTemplatePage(page).expectGallery();
  });
});
