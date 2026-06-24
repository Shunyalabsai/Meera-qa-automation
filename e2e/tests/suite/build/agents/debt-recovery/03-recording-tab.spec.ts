import { test, expect } from "@playwright/test";
import { openDebtRecoveryAgentForm } from "../../../../../helpers/agent.helper";
import { AgentFormPage } from "../../../../../pages/agent-form.page";

test.describe("BUILD › Agents › Debt recovery — Recording tab @journey @debt-recovery", () => {
  test.beforeEach(async ({ page }) => {
    const form = await openDebtRecoveryAgentForm(page);
    await form.openTab("Recording");
  });

  test("TC-AG-DR-030 @medium @ui — Recording tab shows call recording section", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    await form.expectRecordingTabContent();
    await expect(
      page.getByText(/stereo MP3|90 days|left channel/i).first(),
    ).toBeVisible();
  });

  test("TC-AG-DR-031 @medium @positive — Record all calls checkbox toggles", async ({
    page,
  }) => {
    const form = new AgentFormPage(page);
    const cb = form.checkboxByLabel(/Record all calls/i);
    await cb.check();
    await expect(cb).toBeChecked();
    await cb.uncheck();
    await expect(cb).not.toBeChecked();
  });
});
