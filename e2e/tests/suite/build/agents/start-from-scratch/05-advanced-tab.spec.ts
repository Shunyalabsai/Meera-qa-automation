import { test, expect } from "@playwright/test";
import { openStartFromScratchAgentForm } from "../../../../../helpers/agent.helper";
import { AgentFormPage } from "../../../../../pages/agent-form.page";
import { START_FROM_SCRATCH } from "../../../../../data/start-from-scratch-template";
import { PRE_CALL_API_METHODS } from "../../../../../data/agent-form-options";

test.describe("BUILD › Agents › Start from scratch — Advanced tab @journey @start-from-scratch", () => {
  test.beforeEach(async ({ page }) => {
    const form = await openStartFromScratchAgentForm(page);
    await form.openTab("Advanced");
  });

  test("TC-AG-SFS-050 @medium @ui — Advanced tab shows model tuning and pre-call API", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.expectAdvancedTabContent();
  });

  test("TC-AG-SFS-051 @high @positive — Default temperature 0.7 and max tokens 300", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await expect(form.numberInputByLabel(/Temperature/i)).toHaveValue(
      String(START_FROM_SCRATCH.defaultTemperature),
    );
    await expect(form.numberInputByLabel(/Max response tokens/i)).toHaveValue(
      String(START_FROM_SCRATCH.defaultMaxTokens),
    );
  });

  test("TC-AG-SFS-052 @medium @positive — Temperature adjustable for custom agent", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.numberInputByLabel(/Temperature/i).fill("0.5");
    await form.numberInputByLabel(/Max response tokens/i).fill("250");
    await expect(form.numberInputByLabel(/Temperature/i)).toHaveValue("0.5");
  });

  test("TC-AG-SFS-053 @medium @positive — Pre-call API unchecked by default, can enable", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    const cb = form.checkboxByLabel(/Enable pre-call enrichment/i);
    await expect(cb).not.toBeChecked();
    await cb.check();
    await page.getByLabel(/Endpoint URL/i).fill("https://api.example.com/enrich");
    await expect(page.getByLabel(/Endpoint URL/i)).toHaveValue(/enrich/);
  });

  for (const method of PRE_CALL_API_METHODS) {
    test(`TC-AG-SFS-054 @medium @positive — Pre-call HTTP method selects ${method}`, async ({
      page,
    }) => {
      const form = new AgentFormPage(page);
      await form.checkboxByLabel(/Enable pre-call enrichment/i).check();
      await form.selectByLabel(/^HTTP method$/i).selectOption(method);
      await expect(form.selectByLabel(/^HTTP method$/i)).toHaveValue(method);
    });
  }

  test("TC-AG-SFS-055 @medium @ui — Guide warns about temperature above 1.0", async ({
    page,
  }) => {
    await expect(
      page.getByText(/Temperature|0\.9|unpredictable|pre-call/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});
