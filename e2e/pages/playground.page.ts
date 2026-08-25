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
    const isNativeSelect = await select.evaluate((el) => el.tagName === "SELECT").catch(() => false);
    if (isNativeSelect) {
      await expect(select.locator("option").first()).toHaveText(/Pick an agent/i);
    } else {
      await expect(select).toContainText(/Pick an agent/i);
    }
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

  agentSelect(): Locator {
    return this.page
      .getByRole("main")
      .getByRole("combobox", { name: /^Agent/i })
      .or(this.page.getByRole("main").getByRole("button", { name: /^Agent/i }))
      .or(this.page.getByRole("main").locator("button").filter({ hasText: /Pick an agent/i }))
      .or(this.page.getByRole("main").getByRole("combobox"))
      .or(this.page.getByRole("main").locator("select"))
      .first();
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

  fromNumberSelect(): Locator {
    return this.page
      .getByRole("main")
      .getByRole("combobox", { name: /From number/i })
      .or(this.page.getByRole("main").getByRole("button", { name: /From number/i }))
      .or(this.page.getByRole("main").locator("button").filter({ hasText: /Use org default/i }))
      .or(this.page.getByLabel(/From number/i))
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
    const select = this.agentSelect();
    const isNative = await select.evaluate((el) => el.tagName === "SELECT").catch(() => false);
    if (isNative) {
      return select.inputValue();
    }
    return (await select.textContent()) ?? "";
  }

  /** Wait until the agent dropdown is populated beyond the "Pick an agent" placeholder. */
  async waitForAgentOptions(): Promise<void> {
    await expect(this.agentSelect()).toBeVisible({ timeout: 30_000 });
    await waitForLoadingToClear(this.page);
  }

  async hasSelectableAgent(): Promise<boolean> {
    await this.waitForAgentOptions();
    const select = this.agentSelect();
    const isNativeSelect = await select.evaluate((el) => el.tagName === "SELECT").catch(() => false);
    if (isNativeSelect) {
      const options = select.locator("option");
      const count = await options.count();
      for (let i = 0; i < count; i++) {
        const val = await options.nth(i).getAttribute("value");
        if (val && val.trim() && !/pick|select/i.test(await options.nth(i).textContent() ?? "")) {
          return true;
        }
      }
      return false;
    }

    await select.click();
    const options = this.page.locator('[role="listbox"] [role="option"], [role="menu"] [role="menuitem"], div[data-radix-popper-content-wrapper] [role="option"], div[data-radix-popper-content-wrapper] button, ul li');
    const count = await options.count().catch(() => 0);
    let found = false;
    for (let i = 0; i < count; i++) {
      const text = (await options.nth(i).textContent()) ?? "";
      if (text.trim() && !/pick an agent|select agent/i.test(text)) {
        found = true;
        break;
      }
    }
    await this.page.keyboard.press("Escape").catch(() => {});
    return found;
  }

  async selectFirstAgent(): Promise<string | null> {
    await this.waitForAgentOptions();
    const select = this.agentSelect();
    const isNativeSelect = await select.evaluate((el) => el.tagName === "SELECT").catch(() => false);
    if (isNativeSelect) {
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

    await select.click();
    const option = this.page
      .locator('[role="listbox"] [role="option"], [role="menu"] [role="menuitem"], div[data-radix-popper-content-wrapper] [role="option"], div[data-radix-popper-content-wrapper] button, ul li')
      .filter({ hasNotText: /pick an agent/i })
      .first();

    if (await option.isVisible({ timeout: 2_000 }).catch(() => false)) {
      const text = (await option.textContent())?.trim() ?? "agent";
      await option.click();
      return text;
    }
    await this.page.keyboard.press("Escape").catch(() => {});
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
