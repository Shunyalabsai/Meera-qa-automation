import { test, expect } from "@playwright/test";
import { openAppointmentReminderRescheduleAgentForm } from "../../../../../helpers/agent.helper";
import { AgentFormPage } from "../../../../../pages/agent-form.page";
import { PRE_CALL_API_METHODS } from "../../../../../data/agent-form-options";

test.describe("BUILD › Agents › Appointment Reminder & Reschedule — Advanced tab @journey @appointment-reminder-reschedule", () => {
  test.beforeEach(async ({ page }) => {
    const form = await openAppointmentReminderRescheduleAgentForm(page);
    await form.openTab("Advanced");
  });

  test("TC-AG-AR-050 @medium @ui — Advanced tab shows model tuning and pre-call API", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.expectAdvancedTabContent();
  });

  test("TC-AG-AR-051 @high @positive — Default temperature 0.7 and max tokens 300", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await expect(form.numberInputByLabel(/Temperature/i)).toHaveValue("0.7");
    await expect(form.numberInputByLabel(/Max response tokens/i)).toHaveValue("300");
  });

  test("TC-AG-AR-052 @medium @positive — Pre-call API for appointment enrichment", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.checkboxByLabel(/Enable pre-call enrichment/i).check();
    await page
      .getByLabel(/Endpoint URL/i)
      .fill("https://api.example.com/appointment-enrich");
    await expect(page.getByLabel(/Endpoint URL/i)).toHaveValue(
      /appointment-enrich/,
    );
  });

  for (const method of PRE_CALL_API_METHODS) {
    test(`TC-AG-AR-053 @medium @positive — Pre-call HTTP method selects ${method}`, async ({
      page,
    }) => {
      const form = new AgentFormPage(page);
      await form.checkboxByLabel(/Enable pre-call enrichment/i).check();
      await form.selectByLabel(/^HTTP method$/i).selectOption(method);
      await expect(form.selectByLabel(/^HTTP method$/i)).toHaveValue(method);
    });
  }

  test("TC-AG-AR-054 @medium @ui — Guide shows pre-call variable example", async ({
    page,
  }) => {
    await expect(
      page.getByText(/customerName|dueDate|balance|pre-call/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});
