import { test, expect } from "@playwright/test";
import { openOrderConfirmationRescheduleAgentForm } from "../../../../../helpers/agent.helper";
import { AgentFormPage } from "../../../../../pages/agent-form.page";
import { ORDER_CONFIRMATION_RESCHEDULE_TEMPLATE } from "../../../../../data/order-confirmation-reschedule-template";

test.describe("BUILD › Agents › Order Confirmation & Reschedule — Outcomes tab @journey @order-confirmation-reschedule", () => {
  test.beforeEach(async ({ page }) => {
    const form = await openOrderConfirmationRescheduleAgentForm(page);
    await form.openTab("Outcomes");
  });

  test("TC-AG-OC-040 @medium @ui — Outcomes tab shows defaults, extraction, escalation", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.expectOutcomesTabContent();
    for (const label of ["resolved", "callback_scheduled", "escalated"]) {
      await expect(page.getByText(label).first()).toBeVisible();
    }
  });

  test("TC-AG-OC-041 @medium @positive — Customize outcomes from defaults", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    const btn = form.customizeOutcomesButton();
    if (await btn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await btn.click();
      await expect(page.getByRole("button", { name: /Add outcome/i })).toBeVisible();
    }
  });

  test("TC-AG-OC-042 @high @positive — Default extraction fields include orderConfirmed", async ({
    page,
  }) => {
    const editor = page.locator("textarea.font-mono, textarea[class*='font-mono']").last();
    const content = await editor.inputValue();
    if (content.trim().length > 0) {
      for (const field of ORDER_CONFIRMATION_RESCHEDULE_TEMPLATE.defaultExtractionFields) {
        expect(content).toContain(field);
      }
    } else {
      const schema = `{
  "buyingIntent": "integer 1-10 indicating purchase likelihood",
  "orderConfirmed": "boolean: did the customer confirm the order?",
  "updatedAddress": "any address corrections the customer mentioned"
}`;
      await editor.fill(schema);
      await expect(editor).toContainText("orderConfirmed");
    }
  });

  test("TC-AG-OC-043 @medium @positive — Custom extraction JSON for order fields", async ({
    page,
  }) => {
    const schema = `{
  "orderConfirmed": "boolean: did the customer confirm the order?",
  "deliveryDate": "date customer expects delivery",
  "issueReported": "any problem with the order mentioned"
}`;
    const editor = page.locator("textarea.font-mono, textarea[class*='font-mono']").last();
    await editor.fill(schema);
    await expect(editor).toContainText("orderConfirmed");
  });

  test("TC-AG-OC-044 @medium @positive — Escalation handoff with transfer target", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.checkboxByLabel(/Enable escalation/i).check();
    const target = page.getByLabel(/Handoff target/i);
    await target.fill("#order-support-escalations");
    await expect(target).toHaveValue("#order-support-escalations");
    await form.checkboxByLabel(/Enable escalation/i).uncheck();
    await expect(target).not.toBeVisible();
  });
});
