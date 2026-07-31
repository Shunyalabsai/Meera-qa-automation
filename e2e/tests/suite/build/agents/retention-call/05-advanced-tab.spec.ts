import { test, expect } from "@playwright/test";
import { openRetentionCallAgentForm } from "../../../../../helpers/agent.helper";
import { AgentFormPage } from "../../../../../pages/agent-form.page";
import { PRE_CALL_API_METHODS } from "../../../../../data/agent-form-options";

test.describe("BUILD › Agents › Retention Call — Advanced tab @journey @retention-call", () => {
  test.beforeEach(async ({ page }) => {
    const form = await openRetentionCallAgentForm(page);
    await form.openTab("Advanced");
  });

  test("TC-AG-CS-050 @medium @ui — Advanced tab shows model tuning and pre-call API", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.expectAdvancedTabContent();
  });

  test("TC-AG-CS-051 @high @positive — Default temperature 0.7 and max tokens 300", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await expect(form.numberInputByLabel(/Temperature/i)).toHaveValue("0.7");
    await expect(form.numberInputByLabel(/Max response tokens/i)).toHaveValue("300");
  });

  test("TC-AG-CS-052 @medium @positive — Temperature 0.7 suitable for open-ended support", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.numberInputByLabel(/Temperature/i).fill("0.8");
    await form.numberInputByLabel(/Max response tokens/i).fill("300");
    await expect(form.numberInputByLabel(/Temperature/i)).toHaveValue("0.8");
  });

  test("TC-AG-CS-053 @medium @positive — Pre-call API for customer context enrichment", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.checkboxByLabel(/Enable pre-call enrichment/i).check();
    await page
      .getByLabel(/Endpoint URL/i)
      .fill("https://api.example.com/support-context");
    await expect(page.getByLabel(/Endpoint URL/i)).toHaveValue(/support-context/);
  });

  for (const method of PRE_CALL_API_METHODS) {
    test(`TC-AG-CS-054 @medium @positive — Pre-call HTTP method selects ${method}`, async ({
      page,
    }) => {
      const form = new AgentFormPage(page);
      await form.checkboxByLabel(/Enable pre-call enrichment/i).check();
      await form.selectByLabel(/^HTTP method$/i).selectOption(method);
      await expect(form.selectByLabel(/^HTTP method$/i)).toHaveValue(method);
    });
  }

  test("TC-AG-CS-055 @medium @ui — Guide recommends temperature 0.7-0.9 for support", async ({
    page,
  }) => {
    await expect(
      page.getByText(/0\.7|0\.9|open-ended support|temperature/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});
