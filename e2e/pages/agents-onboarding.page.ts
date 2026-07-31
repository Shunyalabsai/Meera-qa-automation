import { Page, expect, Locator } from "@playwright/test";
import { gotoApp } from "../helpers/navigate";

/**
 * "Get started" onboarding checklist on the Agents dashboard.
 *
 * The card shows at /agents (independent of agent count, until dismissed) and
 * contains 4 step links:
 *   1. Create an agent       → /agents or /agents/new (done/undone)
 *   2. Test in Playground    → /playground
 *   3. Add a phone number    → /phone-numbers
 *   4. Run a campaign        → /campaigns
 * plus a "New agent" CTA → /agents/new.
 */
export class AgentsOnboardingPage {
  constructor(private readonly page: Page) {}

  async open() {
    await gotoApp(this.page, "agents");
    await expect(this.page.getByRole("heading", { name: "Agents" })).toBeVisible({
      timeout: 45_000,
    });
  }

  /** True when the "Get started" checklist card is visible on /agents.
   *  The card is attached to the DOM but hidden until the agents data fetch
   *  resolves, so isVisible() (which does not wait for visibility) is unreliable —
   *  use waitFor({ state: "visible" }) to poll until it actually paints. */
  async isEmptyState(): Promise<boolean> {
    try {
      await this.page
        .getByRole("heading", { name: "Get started" })
        .waitFor({ state: "visible", timeout: 12_000 });
      return true;
    } catch {
      return false;
    }
  }

  async expectEmptyState() {
    await expect(
      this.page.getByRole("heading", { name: "Get started" }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      this.page.getByText(/Complete these steps to run your first call/i),
    ).toBeVisible();

    await this.expectStepVisible(
      /Create an agent/i,
      /Define what your agent does, how it speaks, and what it says/i,
    );
    await this.expectStepVisible(
      /Test in Playground/i,
      /Make a live test call before going to production/i,
    );
    await this.expectStepVisible(
      /Add a phone number/i,
      /Assign an inbound or outbound number so calls can be made/i,
    );
    await this.expectStepVisible(
      /Run a campaign/i,
      /Reach your customers at scale with automated outbound calls/i,
    );

    await expect(this.newAgentCta().first()).toBeVisible();
  }

  async expectAllSteps() {
    for (const step of [
      /Create an agent/i,
      /Test in Playground/i,
      /Add a phone number/i,
      /Run a campaign/i,
    ]) {
      await expect(this.stepCard(step)).toBeVisible();
    }
  }

  private async expectStepVisible(title: RegExp, description: RegExp) {
    const step = this.stepCard(title);
    await expect(step).toBeVisible();
    await expect(step.getByText(description).first()).toBeVisible();
  }

  /** Step card — an <a> in the Get-started grid (accessible name = title + description). */
  stepCard(title: RegExp): Locator {
    return this.page
      .getByRole("link", { name: title })
      .or(this.page.getByRole("button", { name: title }))
      .first();
  }

  newAgentCta(): Locator {
    return this.page
      .getByRole("link", { name: /New agent/i })
      .or(this.page.getByRole("button", { name: /New agent/i }));
  }

  async clickNewAgentCta() {
    await this.newAgentCta().first().click();
    await expect(this.page).toHaveURL(/\/agents\/new/, { timeout: 30_000 });
  }

  async clickCreateAgentStep() {
    await this.stepCard(/Create an agent/i).click();
  }

  async clickTestInPlaygroundStep() {
    await this.stepCard(/Test in Playground/i).click();
  }

  async clickAddPhoneNumberStep() {
    await this.stepCard(/Add a phone number/i).click();
  }

  async clickRunCampaignStep() {
    await this.stepCard(/Run a campaign/i).click();
  }
}
