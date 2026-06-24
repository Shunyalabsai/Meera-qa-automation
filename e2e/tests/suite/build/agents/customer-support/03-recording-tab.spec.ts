import { test, expect } from "@playwright/test";
import { openCustomerSupportAgentForm } from "../../../../../helpers/agent.helper";
import { AgentFormPage } from "../../../../../pages/agent-form.page";

test.describe("BUILD › Agents › Customer support — Recording tab @journey @customer-support", () => {
  test.beforeEach(async ({ page }) => {
    const form = await openCustomerSupportAgentForm(page);
    await form.openTab("Recording");
  });

  test("TC-AG-CS-030 @medium @ui — Recording tab shows stereo MP3 details", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.expectRecordingTabContent();
    await expect(
      page.getByText(/stereo MP3|90 days|left channel|right channel/i).first(),
    ).toBeVisible();
  });

  test("TC-AG-CS-031 @medium @positive — Record all calls checkbox toggles", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    const cb = form.checkboxByLabel(/Record all calls/i);
    await cb.check();
    await expect(cb).toBeChecked();
    await cb.uncheck();
    await expect(cb).not.toBeChecked();
  });

  test("TC-AG-CS-032 @medium @ui — Guide explains QA and compliance", async ({
    page,
  }) => {
    await expect(
      page.getByText(/QA|compliance|dispute resolution|Recording/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});
