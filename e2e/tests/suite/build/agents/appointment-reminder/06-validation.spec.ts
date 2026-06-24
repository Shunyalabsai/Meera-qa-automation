import { test, expect } from "@playwright/test";
import { createAppointmentReminderAgent } from "../../../../../helpers/appointment-reminder.helper";
import { AgentsListPage } from "../../../../../pages/agents-list.page";
import { uniqueName } from "../../../../../utils/test-data";

test.describe("BUILD › Agents › Appointment reminder — Lifecycle edge cases @negative @appointment-reminder @edge", () => {
  test("TC-AG-AR-N114 @medium — Delete cancelled keeps agent in list", async ({
    page,
  }) => {
    const name = uniqueName("AR_DeleteCancel");
    await createAppointmentReminderAgent(page, {
      name,
      firstMessage:
        "Hi {{customerName}}, I'm calling to remind you about your appointment on {{appointmentDate}}.",
    });

    const agents = new AgentsListPage(page);
    await agents.open();
    await agents.cancelDeleteAgent(name);
    await agents.expectAgentVisible(name);
    await agents.deleteAgent(name);
  });

  test("TC-AG-AR-N115 @medium — Clone cancelled keeps single agent", async ({
    page,
  }) => {
    const name = uniqueName("AR_CloneCancel");
    await createAppointmentReminderAgent(page, {
      name,
      firstMessage:
        "Hi {{customerName}}, I'm calling to remind you about your appointment on {{appointmentDate}}.",
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
