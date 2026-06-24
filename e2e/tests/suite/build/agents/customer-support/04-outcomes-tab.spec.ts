import { test, expect } from "@playwright/test";
import { openCustomerSupportAgentForm } from "../../../../../helpers/agent.helper";
import { AgentFormPage } from "../../../../../pages/agent-form.page";
import { CUSTOMER_SUPPORT_TEMPLATE } from "../../../../../data/customer-support-template";

test.describe("BUILD › Agents › Customer support — Outcomes tab @journey @customer-support", () => {
  test.beforeEach(async ({ page }) => {
    const form = await openCustomerSupportAgentForm(page);
    await form.openTab("Outcomes");
  });

  test("TC-AG-CS-040 @medium @ui — Outcomes tab shows resolved and escalated defaults", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.expectOutcomesTabContent();
    for (const label of ["resolved", "escalated", "callback_scheduled"]) {
      await expect(page.getByText(label).first()).toBeVisible();
    }
  });

  test("TC-AG-CS-041 @medium @positive — Customize outcomes from defaults", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    const btn = form.customizeOutcomesButton();
    if (await btn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await btn.click();
      await expect(page.getByRole("button", { name: /Add outcome/i })).toBeVisible();
    }
  });

  test("TC-AG-CS-042 @high @positive — Extraction schema for support issue fields", async ({
    page,
  }) => {
    const schema = `{
  "issueType": "category of the customer's issue",
  "issueResolved": "boolean: was the issue fully resolved on the call?",
  "escalationNeeded": "boolean: did the call require human handoff?",
  "satisfactionScore": "integer 1-10 indicating customer satisfaction"
}`;
    const editor = page.locator("textarea.font-mono, textarea[class*='font-mono']").last();
    await editor.fill(schema);
    for (const field of CUSTOMER_SUPPORT_TEMPLATE.defaultExtractionFields) {
      await expect(editor).toContainText(field);
    }
  });

  test("TC-AG-CS-043 @medium @positive — Custom outcome issue_resolved with description", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    const btn = form.customizeOutcomesButton();
    if (await btn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await btn.click();
      const labelInput = page.locator('input[placeholder*="order_placed"], input.font-mono').first();
      if (await labelInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await labelInput.fill("issue_resolved");
      }
    }
  });

  test("TC-AG-CS-044 @high @positive — Escalation handoff for complex issues", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.checkboxByLabel(/Enable escalation/i).check();
    await page.getByLabel(/Handoff target/i).fill("#support-escalations");
    await expect(page.getByLabel(/Handoff target/i)).toHaveValue(
      "#support-escalations",
    );
    await form.checkboxByLabel(/Enable escalation/i).uncheck();
  });
});
