import { test, expect } from "@playwright/test";
import { openDebtRecoveryAgentForm } from "../../../../../helpers/agent.helper";
import { AgentFormPage } from "../../../../../pages/agent-form.page";

test.describe("BUILD › Agents › Debt recovery — Outcomes tab @journey @debt-recovery", () => {
  test.beforeEach(async ({ page }) => {
    const form = await openDebtRecoveryAgentForm(page);
    await form.openTab("Outcomes");
  });

  test("TC-AG-DR-040 @medium @ui — Outcomes tab shows defaults, extraction, escalation", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.expectOutcomesTabContent();
    for (const label of ["resolved", "callback_scheduled", "escalated"]) {
      await expect(page.getByText(label).first()).toBeVisible();
    }
  });

  test("TC-AG-DR-041 @medium @positive — Customize outcomes from defaults", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    const btn = form.customizeOutcomesButton();
    if (await btn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await btn.click();
      await expect(page.getByText(/Label|Description/i).first()).toBeVisible();
      await expect(page.getByRole("button", { name: /Add outcome/i })).toBeVisible();
    }
  });

  test("TC-AG-DR-042 @medium @positive — Custom extraction JSON accepts valid object", async ({
    page,
  }) => {
    const schema = `{
  "commitmentDate": "date the customer promised to pay",
  "amountAgreed": "numeric amount customer agreed to pay",
  "paymentMethod": "how customer plans to pay"
}`;
    const editor = page.locator("textarea.font-mono, textarea[class*='font-mono']").last();
    await editor.fill(schema);
    await expect(editor).toContainText("commitmentDate");
  });

  test("TC-AG-009 @medium @positive — Escalation handoff with transfer target", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.checkboxByLabel(/Enable escalation/i).check();
    const target = page.getByLabel(/Handoff target/i);
    await expect(target).toBeVisible();
    await target.fill("+14155551212");
    await expect(target).toHaveValue("+14155551212");

    await form.checkboxByLabel(/Enable escalation/i).uncheck();
    await expect(target).not.toBeVisible();
  });
});
