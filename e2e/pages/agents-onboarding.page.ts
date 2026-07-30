import { Page, expect, Locator } from "@playwright/test";
import { gotoApp } from "../helpers/navigate";

/** Agents list empty state — new-user onboarding dashboard at /agents. */
export class AgentsOnboardingPage {
  constructor(private readonly page: Page) {}

  async open() {
    await gotoApp(this.page, "agents");
    await expect(this.page.getByRole("heading", { name: "Agents" })).toBeVisible({
      timeout: 45_000,
    });
  }

  /** True when onboarding/empty workspace — no populated agents list with New agent link. */
  async isEmptyState(): Promise<boolean> {
    const hero = await this.page
      .getByText(/Build your first voice agent/i)
      .isVisible({ timeout: 3_000 })
      .catch(() => false);
    if (hero) return true;

    const newAgentLink = await this.page
      .getByRole("link", { name: /New agent/i })
      .isVisible({ timeout: 2_000 })
      .catch(() => false);
    if (newAgentLink) return false;

    const onboardingCta = await this.createFirstAgentCta()
      .first()
      .isVisible({ timeout: 2_000 })
      .catch(() => false);
    const getStarted = await this.page
      .getByText(/^Get started$/i)
      .isVisible({ timeout: 2_000 })
      .catch(() => false);
    const zeroAgents = await this.page
      .getByText(/0 total/i)
      .isVisible({ timeout: 2_000 })
      .catch(() => false);

    return onboardingCta || getStarted || zeroAgents;
  }

  async expectEmptyState() {
    await expect(
      this.page.getByText(/Build your first voice agent/i),
    ).toBeVisible({ timeout: 30_000 });

    await expect(
      this.page.getByText(
        /AI that calls your customers|handles conversations|logs outcomes/i,
      ),
    ).toBeVisible();

    await this.expectStepVisible(
      /Create an agent/i,
      /Write what your agent should do|set its language and tone/i,
    );
    await this.expectStepVisible(
      /Add a phone number/i,
      /Assign an inbound or outbound number/i,
    );
    await this.expectStepVisible(
      /Test in Playground/i,
      /Make a live test call before going to production/i,
    );

    await expect(this.createFirstAgentCta()).toBeVisible();
  }

  private async expectStepVisible(title: RegExp, description: RegExp) {
    await expect(this.page.getByText(title).first()).toBeVisible();
    await expect(this.page.getByText(description).first()).toBeVisible();
  }

  /** Numbered step card — entire row is a link/button. */
  stepCard(title: RegExp): Locator {
    return this.page
      .getByRole("link", { name: title })
      .or(this.page.getByRole("button", { name: title }))
      .or(this.page.locator("a, button").filter({ hasText: title }))
      .first();
  }

  createFirstAgentCta(): Locator {
    return this.page
      .getByRole("link", { name: /Create your first agent/i })
      .or(this.page.getByRole("button", { name: /Create your first agent/i }));
  }

  async clickCreateAgentStep() {
    await this.stepCard(/Create an agent/i).click();
  }

  async clickAddPhoneNumberStep() {
    await this.stepCard(/Add a phone number/i).click();
  }

  async clickTestInPlaygroundStep() {
    await this.stepCard(/Test in Playground/i).click();
  }

  async clickCreateFirstAgentCta() {
    await this.createFirstAgentCta().first().click();
  }
}
