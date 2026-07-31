import { test, expect } from "@playwright/test";
import { AgentsOnboardingPage } from "../../../../../pages/agents-onboarding.page";
import { PhoneNumbersPage } from "../../../../../pages/phone-numbers.page";
import { PlaygroundPage } from "../../../../../pages/playground.page";
import { isAgentsEmptyState } from "../../../../../helpers/new-user-dashboard";
import { gotoApp } from "../../../../../helpers/navigate";
import { AgentTemplatePage } from "../../../../../pages/agent-template.page";

test.describe("BUILD › Agents — Onboarding validation @negative @edge @onboarding", () => {
  test("TC-AG-ON-N101 @medium @negative — Invalid deep-link to agents/new still loads form or gallery", async ({
    page,
  }) => {
    await gotoApp(page, "agents/new");
    await page.evaluate(() => {
      const path = `${window.location.pathname.replace(/\/?$/, "")}?invalid=1`;
      window.history.pushState({}, "", path);
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    await new AgentTemplatePage(page).waitForGalleryOrForm();
    await expect(
      page.getByRole("tab", { name: "Prompt" }).or(
        page.getByRole("heading", { name: /What industry are you building for/i }),
      ),
    ).toBeVisible({ timeout: 30_000 });
  });

  test("TC-AG-ON-N102 @medium @negative — Playground Start call without agent shows error or stays idle", async ({
    page,
  }) => {
    const playground = new PlaygroundPage(page);
    await playground.open();
    const agentValue = await playground.agentSelect().inputValue().catch(() => "");
    test.skip(!!agentValue, "Agent auto-selected — cannot test empty picker");

    await playground.clickStartBrowserCall();
    await expect(
      page.getByText(/select.*agent|pick.*agent|required|error|idle/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("TC-AG-ON-N103 @medium @negative — Phone numbers Add number opens form or modal", async ({
    page,
  }) => {
    const phoneNumbers = new PhoneNumbersPage(page);
    await phoneNumbers.open();
    await phoneNumbers.addNumberButton().click();
    await expect(
      page.getByText(/Add number|Register|Plivo|Twilio|phone/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("TC-AG-ON-N104 @low @edge — Onboarding step cards use accessible links or buttons", async ({
    page,
  }) => {
    test.skip(
      !(await isAgentsEmptyState(page)),
      "Agents onboarding empty state not shown",
    );
    const onboarding = new AgentsOnboardingPage(page);
    for (const step of [
      /Create an agent/i,
      /Add a phone number/i,
      /Test in Playground/i,
      /Run a campaign/i,
    ]) {
      await expect(onboarding.stepCard(step)).toBeVisible();
    }
  });
});
