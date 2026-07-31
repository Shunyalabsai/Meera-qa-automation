import { test, expect } from "@playwright/test";
import { createCreditCardPaymentReminderAgent } from "../../../../../helpers/credit-card-payment-reminder.helper";
import { AgentsListPage } from "../../../../../pages/agents-list.page";
import { uniqueName } from "../../../../../utils/test-data";

/**
 * Credit Card Payment Reminder lifecycle edge cases (require a persisted agent).
 * Form validation edges are in ../templates/edge-cases.spec.ts (all cards).
 */
test.describe("BUILD › Agents › Credit Card Payment Reminder — Lifecycle edge cases @negative @credit-card-payment-reminder @edge", () => {
  test("TC-AG-DR-N114 @medium — Delete cancelled keeps agent in list", async ({
    page,
  }) => {
    const name = uniqueName("DeleteCancel");
    await createCreditCardPaymentReminderAgent(page, {
      name,
      language: "en",
      firstMessage: "Hello, this is a test call.",
    });

    const agents = new AgentsListPage(page);
    await agents.open();
    await agents.cancelDeleteAgent(name);
    await agents.expectAgentVisible(name);
    await agents.deleteAgent(name);
  });

  test("TC-AG-DR-N115 @medium — Clone cancelled keeps single agent", async ({
    page,
  }) => {
    const name = uniqueName("CloneCancel");
    await createCreditCardPaymentReminderAgent(page, {
      name,
      language: "en",
      firstMessage: "Hello, this is a test call.",
    });

    const agents = new AgentsListPage(page);
    await agents.open();
    const row = agents.agentRow(name);
    page.once("dialog", (d) => d.dismiss());
    await row.getByRole("button", { name: "Clone" }).click();
    await agents.expectAgentVisible(name);
    await expect(
      page.getByText(`${name} (copy)`, { exact: false }),
    ).not.toBeVisible({ timeout: 3_000 });

    await agents.deleteAgent(name);
  });
});
