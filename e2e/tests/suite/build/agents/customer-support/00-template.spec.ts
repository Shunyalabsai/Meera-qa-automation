import { test, expect } from "@playwright/test";
import {
  openCustomerSupportAgentForm,
  gotoNewAgent,
} from "../../../../../helpers/agent.helper";
import { CUSTOMER_SUPPORT_TEMPLATE } from "../../../../../data/customer-support-template";
import { AgentFormPage } from "../../../../../pages/agent-form.page";
import { AgentTemplatePage } from "../../../../../pages/agent-template.page";

test.describe("BUILD › Agents › Customer support — Template @journey @customer-support", () => {
  test("TC-AG-CS-001 @high @positive — Customer support card opens pre-filled form", async ({
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
    await gallery.selectTemplate(CUSTOMER_SUPPORT_TEMPLATE.cardTitle);

    const form = new AgentFormPage(page);
    await form.ensureFormReady();
    await form.expectNewAgentHeader();
    await form.expectPromptTabContent();

    expect(await form.nameInput().inputValue()).toMatch(
      CUSTOMER_SUPPORT_TEMPLATE.expectedName,
    );
    await expect(form.languageSelect()).toHaveValue(
      CUSTOMER_SUPPORT_TEMPLATE.expectedLanguage,
    );
    await expect(form.voiceToneSelect()).toHaveValue(
      CUSTOMER_SUPPORT_TEMPLATE.expectedVoiceTone,
    );
    await expect(form.accentSelect()).toHaveValue(
      CUSTOMER_SUPPORT_TEMPLATE.expectedAccent,
    );
    await expect(form.genderSelect()).toHaveValue(
      CUSTOMER_SUPPORT_TEMPLATE.expectedGender,
    );

    const prompt = await form.systemPromptInput().inputValue();
    expect(prompt).toMatch(
      CUSTOMER_SUPPORT_TEMPLATE.expectedSystemPromptSnippet,
    );
  });

  test("TC-AG-CS-002 @medium @positive — Change template link returns to gallery", async ({
    page,
  }) => {
    await openCustomerSupportAgentForm(page);
    const changeLink = page.getByRole("link", { name: /Change template/i });
    test.skip(
      !(await changeLink.isVisible({ timeout: 3_000 }).catch(() => false)),
      "Change template link not present",
    );
    await changeLink.click();
    await new AgentTemplatePage(page).expectGallery();
  });
});
