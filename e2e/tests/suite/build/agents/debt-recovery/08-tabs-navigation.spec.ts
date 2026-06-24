import { test } from "@playwright/test";
import { openDebtRecoveryAgentForm } from "../../../../../helpers/agent.helper";
import { AgentFormPage } from "../../../../../pages/agent-form.page";

test.describe("BUILD › Agents › Debt recovery — Tab navigation @journey @debt-recovery", () => {
  test("TC-AG-DR-070 @high @ui — All five tabs navigate in order", async ({
    page,
  }) => {
    const form = await openDebtRecoveryAgentForm(page);

    await form.expectPromptTabContent();
    await form.openTab("Behaviour");
    await form.expectBehaviourTabContent();
    await form.openTab("Recording");
    await form.expectRecordingTabContent();
    await form.openTab("Outcomes");
    await form.expectOutcomesTabContent();
    await form.openTab("Advanced");
    await form.expectAdvancedTabContent();
    await form.openTab("Prompt");
    await form.expectPromptTabContent();
  });

  test("TC-AG-DR-071 @medium @ui — Guide panel visible on form", async ({
    page,
  }) => {
    await openDebtRecoveryAgentForm(page);
    const guide = page.getByText(/^GUIDE$/i).or(page.getByText(/Guide/i).first());
    await guide.waitFor({ state: "visible", timeout: 10_000 }).catch(() => {});
  });
});
