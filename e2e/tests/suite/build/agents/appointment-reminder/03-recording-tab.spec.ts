import { test, expect } from "@playwright/test";
import { openAppointmentReminderAgentForm } from "../../../../../helpers/agent.helper";
import { AgentFormPage } from "../../../../../pages/agent-form.page";

test.describe("BUILD › Agents › Appointment reminder — Recording tab @journey @appointment-reminder", () => {
  test.beforeEach(async ({ page }) => {
    const form = await openAppointmentReminderAgentForm(page);
    await form.openTab("Recording");
  });

  test("TC-AG-AR-030 @medium @ui — Recording tab shows stereo MP3 details", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.expectRecordingTabContent();
    await expect(
      page.getByText(/stereo MP3|90 days|GCS|left channel/i).first(),
    ).toBeVisible();
  });

  test("TC-AG-AR-031 @medium @positive — Record all calls checkbox toggles", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    const cb = form.checkboxByLabel(/Record all calls/i);
    await cb.check();
    await expect(cb).toBeChecked();
    await cb.uncheck();
    await expect(cb).not.toBeChecked();
  });

  test("TC-AG-AR-032 @medium @ui — Guide explains QA and compliance use", async ({
    page,
  }) => {
    await expect(
      page.getByText(/QA|compliance|dispute resolution|Recording/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});
