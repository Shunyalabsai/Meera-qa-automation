import { Page, expect, Locator } from "@playwright/test";
import { gotoApp, waitForLoadingToClear } from "../helpers/navigate";

/** BUILD › Playground — browser voice and outbound phone call testing. */
export class PlaygroundPage {
  constructor(private readonly page: Page) {}

  async open(agentId?: string) {
    const route = agentId ? `playground?agent_id=${agentId}` : "playground";
    await gotoApp(this.page, route);
    await this.expectHeader();
  }

  async expectHeader() {
    await expect(
      this.page.getByRole("heading", { name: /Playground/i }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      this.page.getByText(/Test your agent|browser voice or outbound phone call/i).first(),
    ).toBeVisible();
  }

  async expectNewUserPlayground() {
    await this.expectHeader();
    await this.expectAgentSection();
    await this.expectModeToggle();
    await this.expectBrowserModePanel();
    await this.expectLogIdle();
  }

  async expectAgentSection() {
    await expect(this.page.getByText(/^Agent$/i).first()).toBeVisible();
    await expect(
      this.page.getByText(/Select the agent to test/i),
    ).toBeVisible();
    const select = this.agentSelect();
    await expect(select).toBeVisible();
    await expect(select.locator("option").first()).toHaveText(/Pick an agent/i);
  }

  async expectModeToggle() {
    await expect(this.browserModeButton()).toBeVisible();
    await expect(this.phoneModeButton()).toBeVisible();
  }

  async expectBrowserModePanel() {
    await expect(
      this.page.getByText(/Browser call|Mic streams PCM/i).first(),
    ).toBeVisible();
    await expect(this.startBrowserCallButton()).toBeVisible();
  }

  async expectPhoneModePanel() {
    await expect(
      this.page.getByText(/Phone call|Dials the customer via Plivo/i).first(),
    ).toBeVisible();
    await expect(this.fromNumberSelect()).toBeVisible();
    await expect(this.toNumberInput()).toBeVisible();
    await expect(this.contextVariablesInput()).toBeVisible();
    await expect(this.startPhoneCallButton()).toBeVisible();
  }

  async expectLogIdle() {
    await expect(this.logPanel()).toBeVisible();
    await expect(
      this.page.getByText(/idle|No activity yet/i).first(),
    ).toBeVisible();
  }

  logPanel(): Locator {
    return this.page.getByText(/^Log$/i).or(this.page.getByText(/Log/i).first());
  }

  agentSelect() {
    return this.page.getByRole("main").getByRole("combobox").first();
  }

  browserModeButton() {
    return this.page.getByRole("tab", { name: /Browser/i });
  }

  phoneModeButton() {
    return this.page.getByRole("tab", { name: /Phone Call|Phone/i });
  }

  startBrowserCallButton() {
    return this.page.getByRole("button", { name: /^Start call$/i });
  }

  startPhoneCallButton() {
    return this.page.getByRole("button", { name: /Start Phone Call|Start call/i });
  }

  fromNumberSelect() {
    return this.page
      .getByLabel(/From number/i)
      .or(
        this.page
          .locator("label")
          .filter({ hasText: /From number/i })
          .locator("xpath=following-sibling::select[1]"),
      )
      .first();
  }

  toNumberInput() {
    // The field is a country-code button + <input type="tel">; the wrapping
    // label is not itself fillable, so target the tel input by placeholder.
    return this.page.locator("main").getByPlaceholder(/9876543210/).first();
  }

  contextVariablesInput() {
    return this.page
      .getByLabel(/Context variables/i)
      .or(
        this.page.locator("textarea").filter({
          has: this.page.getByText(/Context variables/i),
        }),
      )
      .or(this.page.locator("textarea").last());
  }

  async switchToBrowserMode() {
    await this.browserModeButton().click();
    await this.expectBrowserModePanel();
  }

  async switchToPhoneMode() {
    await this.phoneModeButton().click();
    await this.expectPhoneModePanel();
  }

  async selectedAgentValue() {
    return this.agentSelect().inputValue();
  }

  /** Wait until the agent dropdown is populated beyond the "Pick an agent" placeholder. */
  async waitForAgentOptions(): Promise<void> {
    await expect(this.agentSelect()).toBeVisible({ timeout: 30_000 });
    await waitForLoadingToClear(this.page);
    await expect
      .poll(async () => this.agentSelect().locator("option").count(), {
        timeout: 15_000,
      })
      .toBeGreaterThan(1)
      .catch(() => undefined);
  }

  async hasSelectableAgent(): Promise<boolean> {
    await this.waitForAgentOptions();
    const options = this.agentSelect().locator("option");
    const count = await options.count();
    for (let i = 0; i < count; i++) {
      const val = await options.nth(i).getAttribute("value");
      if (val && val.trim() && !/pick|select/i.test(await options.nth(i).textContent() ?? "")) {
        return true;
      }
    }
    return false;
  }

  async selectFirstAgent(): Promise<string | null> {
    await this.waitForAgentOptions();
    const select = this.agentSelect();
    const options = select.locator("option");
    const count = await options.count();
    for (let i = 0; i < count; i++) {
      const val = await options.nth(i).getAttribute("value");
      const text = (await options.nth(i).textContent()) ?? "";
      if (val && val.trim() && !/pick|select/i.test(text)) {
        await select.selectOption(val);
        return val;
      }
    }
    return null;
  }

  async fillToNumber(value: string) {
    await this.toNumberInput().fill(value);
  }

  async fillContextVariables(value: string) {
    await this.contextVariablesInput().fill(value);
  }

  async clickStartBrowserCall() {
    await this.startBrowserCallButton().click();
  }

  async clickStartPhoneCall() {
    await this.startPhoneCallButton().click();
  }

  async expectReady() {
    await expect(this.agentSelect()).toBeVisible();
    await expect(this.startBrowserCallButton()).toBeVisible();
  }
}
