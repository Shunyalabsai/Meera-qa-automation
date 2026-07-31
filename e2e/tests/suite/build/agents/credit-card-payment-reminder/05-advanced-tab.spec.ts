import { test, expect } from "@playwright/test";
import { openCreditCardPaymentReminderAgentForm } from "../../../../../helpers/agent.helper";
import { AgentFormPage } from "../../../../../pages/agent-form.page";
import { PRE_CALL_API_METHODS } from "../../../../../data/agent-form-options";

test.describe("BUILD › Agents › Credit Card Payment Reminder — Advanced tab @journey @credit-card-payment-reminder", () => {
  test.beforeEach(async ({ page }) => {
    const form = await openCreditCardPaymentReminderAgentForm(page);
    await form.openTab("Advanced");
  });

  test("TC-AG-DR-050 @medium @ui — Advanced tab shows model tuning and pre-call API", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.expectAdvancedTabContent();
  });

  test("TC-AG-005 @high @positive — Temperature and max tokens accept valid values", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.numberInputByLabel(/Temperature/i).fill("0.7");
    await form.numberInputByLabel(/Max response tokens/i).fill("300");
    await expect(form.numberInputByLabel(/Temperature/i)).toHaveValue("0.7");
    await expect(form.numberInputByLabel(/Max response tokens/i)).toHaveValue("300");
  });

  test("TC-AG-104 @medium @negative — Temperature above 2.0 shows validation on save", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.numberInputByLabel(/Temperature/i).fill("5");
    await form.openTab("Prompt");
    await form.nameInput().fill("Temp Validation Test");
    await form.createAgentButton().click();

    await expect(
      page
        .getByText(/temperature|Fix the highlighted|Couldn't save/i)
        .first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("TC-AG-DR-051 @medium @positive — Pre-call API reveals endpoint and method", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.checkboxByLabel(/Enable pre-call enrichment/i).check();
    await expect(page.getByLabel(/Endpoint URL/i)).toBeVisible();
    await expect(form.selectByLabel(/^HTTP method$/i)).toBeVisible();
    await page
      .getByLabel(/Endpoint URL/i)
      .fill("https://api.example.com/enrich");
  });

  for (const method of PRE_CALL_API_METHODS) {
    test(`TC-AG-DR-052 @medium @positive — Pre-call HTTP method selects ${method}`, async ({
      page,
    }) => {
      const form = new AgentFormPage(page);
      await form.checkboxByLabel(/Enable pre-call enrichment/i).check();
      await form.selectByLabel(/^HTTP method$/i).selectOption(method);
      await expect(form.selectByLabel(/^HTTP method$/i)).toHaveValue(method);
    });
  }
});
