import { test, expect } from "@playwright/test";
import {
  openOrderConfirmationAgentForm,
  gotoNewAgent,
} from "../../../../../helpers/agent.helper";
import { ORDER_CONFIRMATION_TEMPLATE } from "../../../../../data/order-confirmation-template";
import { AgentFormPage } from "../../../../../pages/agent-form.page";
import { AgentTemplatePage } from "../../../../../pages/agent-template.page";

test.describe("BUILD › Agents › Order confirmation — Template @journey @order-confirmation", () => {
  test("TC-AG-OC-001 @high @positive — Order confirmation card opens pre-filled form", async ({
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
      page.getByText(ORDER_CONFIRMATION_TEMPLATE.cardTitle, { exact: false }),
    ).toBeVisible();
    await gallery.selectTemplate(ORDER_CONFIRMATION_TEMPLATE.cardTitle);

    const form = new AgentFormPage(page);
    await form.ensureFormReady();
    await form.expectNewAgentHeader();
    await form.expectPromptTabContent();

    const name = await form.nameInput().inputValue();
    expect(name).toMatch(ORDER_CONFIRMATION_TEMPLATE.expectedName);

    await expect(form.languageSelect()).toHaveValue(
      ORDER_CONFIRMATION_TEMPLATE.expectedLanguage,
    );
    await expect(form.voiceToneSelect()).toHaveValue(
      ORDER_CONFIRMATION_TEMPLATE.expectedVoiceTone,
    );
    await expect(form.accentSelect()).toHaveValue(
      ORDER_CONFIRMATION_TEMPLATE.expectedAccent,
    );
    await expect(form.genderSelect()).toHaveValue(
      ORDER_CONFIRMATION_TEMPLATE.expectedGender,
    );

    const prompt = await form.systemPromptInput().inputValue();
    expect(prompt).toMatch(
      ORDER_CONFIRMATION_TEMPLATE.expectedSystemPromptSnippet,
    );
  });

  test("TC-AG-OC-002 @medium @positive — Change template link returns to gallery", async ({
    page,
  }) => {
    await openOrderConfirmationAgentForm(page);

    const changeLink = page.getByRole("link", { name: /Change template/i });
    test.skip(
      !(await changeLink.isVisible({ timeout: 3_000 }).catch(() => false)),
      "Change template link not present",
    );

    await changeLink.click();
    await new AgentTemplatePage(page).expectGallery();
  });
});
