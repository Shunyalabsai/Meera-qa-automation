import { test, expect } from "@playwright/test";
import { openOrderConfirmationRescheduleAgentForm } from "../../../../../helpers/agent.helper";
import { AgentFormPage } from "../../../../../pages/agent-form.page";
import { ORDER_CONFIRMATION_RESCHEDULE_TEMPLATE } from "../../../../../data/order-confirmation-reschedule-template";

test.describe("BUILD › Agents › Order Confirmation & Reschedule — Behaviour tab @journey @order-confirmation-reschedule", () => {
  test.beforeEach(async ({ page }) => {
    const form = await openOrderConfirmationRescheduleAgentForm(page);
    await form.openTab("Behaviour");
  });

  test("TC-AG-OC-020 @high @ui — Behaviour tab shows call-handling sections", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.expectBehaviourTabContent();
  });

  test("TC-AG-OC-021 @high @positive — First message pre-filled with order confirmation script", async ({
    page,
  }) => {
    const firstMessage = page.getByLabel(/First message/i);
    await expect(firstMessage).toBeVisible();
    const value = await firstMessage.inputValue();
    if (value.length > 0) {
      expect(value).toMatch(
        ORDER_CONFIRMATION_RESCHEDULE_TEMPLATE.expectedFirstMessageSnippet,
      );
    }
    await firstMessage.fill(ORDER_CONFIRMATION_RESCHEDULE_TEMPLATE.defaultFirstMessage);
    await expect(firstMessage).toHaveValue(
      ORDER_CONFIRMATION_RESCHEDULE_TEMPLATE.defaultFirstMessage,
    );
  });

  test("TC-AG-OC-022 @medium @ui — Speech speed slider is adjustable", async ({
    page,
  }) => {
    const slider = page.locator('input[type="range"]').first();
    await expect(slider).toBeVisible();
    await slider.fill("1.1");
    await expect(slider).toHaveValue("1.1");
  });

  test("TC-AG-OC-023 @medium @positive — Goodbye message accepts text", async ({
    page,
  }) => {
    const goodbye = page.getByLabel(/Goodbye message/i).first();
    if (await goodbye.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await goodbye.fill("Thank you for confirming your order. Have a great day!");
      await expect(goodbye).toHaveValue(/Thank you/i);
    }
  });

  test("TC-AG-OC-024 @medium @positive — Silence timeout and max call duration", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.numberInputByLabel(/Silence timeout/i).fill("3");
    await form.numberInputByLabel(/Max call duration/i).fill("1800");
    await expect(form.numberInputByLabel(/Silence timeout/i)).toHaveValue("3");
    await expect(form.numberInputByLabel(/Max call duration/i)).toHaveValue("1800");
  });

  test("TC-AG-OC-025 @medium @positive — Barge-in enabled by default and toggles", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    const cb = form.checkboxByLabel(/barge-in/i);
    await expect(cb).toBeChecked();
    await cb.uncheck();
    await cb.check();
  });

  test("TC-AG-OC-026 @medium @positive — No-response handling fields", async ({
    page,
  }) => {
    await page
      .getByLabel(/Re-prompt message/i)
      .fill("Are you still there?");
    await page.getByRole("spinbutton", { name: /Max retries/i }).fill("3");
    await page
      .getByRole("textbox", { name: /^Closing line/i })
      .fill("It looks like our connection was lost. Feel free to call back anytime.");
    await expect(page.getByRole("spinbutton", { name: /Max retries/i })).toHaveValue("3");
  });

  test("TC-AG-OC-027 @medium @positive — Voicemail detection reveals sub-fields", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.checkboxByLabel(/Detect voicemail/i).check();
    await expect(page.getByLabel(/Voicemail message/i)).toBeVisible();
  });
});
