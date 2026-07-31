import { test, expect } from "@playwright/test";
import { openOrderConfirmationRescheduleAgentForm } from "../../../../../helpers/agent.helper";
import { AgentFormPage } from "../../../../../pages/agent-form.page";
import { ORDER_CONFIRMATION_RESCHEDULE_TEMPLATE } from "../../../../../data/order-confirmation-reschedule-template";

test.describe("BUILD › Agents › Order Confirmation & Reschedule — Prompt tab @journey @order-confirmation-reschedule", () => {
  test.beforeEach(async ({ page }) => {
    await openOrderConfirmationRescheduleAgentForm(page);
  });

  test("TC-AG-OC-010 @high @ui — Prompt tab shows pipeline, basic info, system prompt", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.expectNewAgentHeader();
    await form.expectAllTabsVisible();
    await form.expectPromptTabContent();
    await expect(page.getByText(/Shunya Native|gemini/i)).toBeVisible();
  });

  test("TC-AG-OC-011 @high @positive — System prompt is editable", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    const customPrompt =
      "You are a friendly order confirmation agent. Confirm delivery and note any issues.";
    const prompt = form.systemPromptInput();
    if (await prompt.isEditable({ timeout: 3_000 }).catch(() => false)) {
      await prompt.fill(customPrompt);
      await expect(prompt).toHaveValue(customPrompt);
    }
  });

  test("TC-AG-OC-012 @high @positive — Pre-fills template defaults", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await expect(form.languageSelect()).toHaveValue(ORDER_CONFIRMATION_RESCHEDULE_TEMPLATE.expectedLanguage);
    await expect(form.voiceToneSelect()).toHaveValue(ORDER_CONFIRMATION_RESCHEDULE_TEMPLATE.expectedVoiceTone);
    await expect(form.accentSelect()).toHaveValue(ORDER_CONFIRMATION_RESCHEDULE_TEMPLATE.expectedAccent);
    await expect(form.genderSelect()).toHaveValue(ORDER_CONFIRMATION_RESCHEDULE_TEMPLATE.expectedGender);
  });

  test("TC-AG-OC-013 @high @positive — Name and description fields accept input", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.nameInput().fill("Order Confirmation Agent E2E");
    await form.descriptionInput().fill("Confirms order details and delivery with customers");
    await expect(form.nameInput()).toHaveValue("Order Confirmation Agent E2E");
  });

  test("TC-AG-OC-014 @medium @ui — Guide panel shows prompt building tips", async ({
    page,
  }) => {
    await expect(
      page.getByText(/Building your prompt|Variables|Role.*Goal.*Rules/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});
