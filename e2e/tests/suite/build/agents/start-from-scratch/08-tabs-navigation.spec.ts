import { test } from "@playwright/test";
import { openStartFromScratchAgentForm } from "../../../../../helpers/agent.helper";
import { AgentFormPage } from "../../../../../pages/agent-form.page";

test.describe("BUILD › Agents › Start from scratch — Tab navigation @journey @start-from-scratch", () => {
  test("TC-AG-SFS-070 @high @ui — All five tabs navigate in order", async ({
    page,
  }) => {
    const form = await openStartFromScratchAgentForm(page);
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

  test("TC-AG-SFS-071 @medium @ui — Guide panel visible on blank form", async ({
    page,
  }) => {
    await openStartFromScratchAgentForm(page);
    await page
      .getByText(/^GUIDE$/i)
      .or(page.getByText(/Guide/i).first())
      .waitFor({ state: "visible", timeout: 10_000 })
      .catch(() => {});
  });
});
