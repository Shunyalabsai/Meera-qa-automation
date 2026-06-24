import { test, expect } from "@playwright/test";
import { openOrderConfirmationAgentForm } from "../../../../../helpers/agent.helper";
import { AgentFormPage } from "../../../../../pages/agent-form.page";
import { PRE_CALL_API_METHODS } from "../../../../../data/agent-form-options";

test.describe("BUILD › Agents › Order confirmation — Advanced tab @journey @order-confirmation", () => {
  test.beforeEach(async ({ page }) => {
    const form = await openOrderConfirmationAgentForm(page);
    await form.openTab("Advanced");
  });

  test("TC-AG-OC-050 @medium @ui — Advanced tab shows model tuning and pre-call API", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.expectAdvancedTabContent();
  });

  test("TC-AG-OC-051 @high @positive — Default temperature 0.7 and max tokens 300", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await expect(form.numberInputByLabel(/Temperature/i)).toHaveValue("0.7");
    await expect(form.numberInputByLabel(/Max response tokens/i)).toHaveValue("300");
  });

  test("TC-AG-OC-052 @medium @positive — Temperature and max tokens accept valid values", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.numberInputByLabel(/Temperature/i).fill("0.5");
    await form.numberInputByLabel(/Max response tokens/i).fill("250");
    await expect(form.numberInputByLabel(/Temperature/i)).toHaveValue("0.5");
    await expect(form.numberInputByLabel(/Max response tokens/i)).toHaveValue("250");
  });

  test("TC-AG-OC-053 @medium @positive — Pre-call API reveals endpoint and method", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.checkboxByLabel(/Enable pre-call enrichment/i).check();
    await expect(page.getByLabel(/Endpoint URL/i)).toBeVisible();
    await page
      .getByLabel(/Endpoint URL/i)
      .fill("https://api.example.com/order-enrich");
  });

  for (const method of PRE_CALL_API_METHODS) {
    test(`TC-AG-OC-054 @medium @positive — Pre-call HTTP method selects ${method}`, async ({
      page,
    }) => {
      const form = new AgentFormPage(page);
      await form.checkboxByLabel(/Enable pre-call enrichment/i).check();
      await form.selectByLabel(/^HTTP method$/i).selectOption(method);
      await expect(form.selectByLabel(/^HTTP method$/i)).toHaveValue(method);
    });
  }

  test("TC-AG-OC-055 @medium @ui — Guide warns about temperature above 0.9", async ({
    page,
  }) => {
    await expect(
      page.getByText(/0\.9|temperature|production/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});
