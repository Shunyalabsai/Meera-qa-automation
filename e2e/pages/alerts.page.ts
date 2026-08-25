import { Page, expect, Locator } from "@playwright/test";
import { gotoApp } from "../helpers/navigate";
import { ALERTS_COPY } from "../data/alerts-data";

/** SETTINGS › Alerts — threshold rules and notification channels. */
export class AlertsPage {
  constructor(private readonly page: Page) {}

  mainPanel(): Locator {
    return this.page.getByRole("main");
  }

  async open() {
    await gotoApp(this.page, "alerts");
    await this.expectPageHeader();
  }

  async expectPageHeader() {
    await expect(
      this.page.getByRole("heading", { name: /^Alerts$/i }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(this.page.getByText(ALERTS_COPY.subtitle).first()).toBeVisible();
  }

  rulesTab(): Locator {
    return this.mainPanel().getByRole("button", { name: /^Rules$/i });
  }

  channelsTab(): Locator {
    return this.mainPanel().getByRole("button", { name: /^Channels$/i });
  }

  async expectTabsVisible() {
    await expect(this.rulesTab()).toBeVisible();
    await expect(this.channelsTab()).toBeVisible();
  }

  newRuleButton(): Locator {
    return this.mainPanel().getByRole("button", { name: /New rule/i });
  }

  addChannelButton(): Locator {
    return this.mainPanel().getByRole("button", { name: /Add channel/i });
  }

  createRuleButton(): Locator {
    return this.mainPanel().getByRole("button", { name: /Create rule/i });
  }

  saveChannelButton(): Locator {
    return this.mainPanel().getByRole("button", { name: /Save channel/i });
  }

  cancelButton(): Locator {
    return this.mainPanel().getByRole("button", { name: /^Cancel$/i });
  }

  fieldCombobox(name: string): Locator {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return this.mainPanel()
      .getByRole("combobox", {
        name: new RegExp(`^${escaped}$`, "i"),
      })
      .or(
        this.mainPanel().getByRole("button", {
          name: new RegExp(`^${escaped}`, "i"),
        }),
      )
      .or(
        this.mainPanel()
          .locator("button")
          .filter({ hasText: new RegExp(`^${escaped}`, "i") }),
      )
      .first();
  }

  fieldTextbox(name: string): Locator {
    return this.mainPanel().getByRole("textbox", {
      name: new RegExp(`^${name}$`, "i"),
    });
  }

  async selectFieldOption(label: string, value: string) {
    const select = this.fieldCombobox(label);
    const isNative = await select.evaluate((el) => el.tagName === "SELECT").catch(() => false);
    if (isNative) {
      await select.selectOption({ label: value }).catch(async () => {
        await select.selectOption(value);
      });
      return;
    }

    await select.click();
    const pattern = new RegExp(`^\\s*${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "i");
    const option = this.page
      .locator('[role="listbox"], [role="menu"], div[data-radix-popper-content-wrapper], div.absolute, ul')
      .getByRole("option", { name: pattern })
      .or(this.page.locator('[role="listbox"], [role="menu"], div[data-radix-popper-content-wrapper], div.absolute, ul').getByRole("button", { name: pattern }))
      .or(this.page.locator('[role="listbox"], [role="menu"], div[data-radix-popper-content-wrapper], div.absolute, ul').getByText(pattern))
      .or(this.page.getByRole("option", { name: pattern }))
      .or(this.page.getByText(pattern))
      .first();

    if (await option.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await option.scrollIntoViewIfNeeded().catch(() => {});
      await option.click({ force: true }).catch(async () => {
        await option.dispatchEvent("click").catch(() => {});
      });
    } else {
      await this.page.keyboard.press("Escape").catch(() => {});
    }
  }

  async expectSelectOptions(label: string, options: readonly string[]) {
    const select = this.fieldCombobox(label);
    const isNative = await select.evaluate((el) => el.tagName === "SELECT").catch(() => false);
    if (isNative) {
      for (const option of options) {
        await expect(
          select.locator("option", {
            hasText: new RegExp(`^${option.replace(/[()]/g, "\\$&")}$`, "i"),
          }),
        ).toHaveCount(1);
      }
      return;
    }

    await select.click();
    const listbox = this.page.locator('[role="listbox"], [role="menu"], div[data-radix-popper-content-wrapper], div.absolute, ul').first();
    await expect(listbox).toBeVisible({ timeout: 5_000 });
    await this.page.keyboard.press("Escape").catch(() => {});
  }

  async expectOperatorOptions(options: readonly string[]) {
    await this.expectSelectOptions("Operator", options);
  }

  nameInput(): Locator {
    return this.fieldTextbox("Name");
  }

  metricSelect(): Locator {
    return this.fieldCombobox("Metric");
  }

  operatorSelect(): Locator {
    return this.fieldCombobox("Operator");
  }

  valueInput(): Locator {
    return this.fieldTextbox("Value");
  }

  severitySelect(): Locator {
    return this.fieldCombobox("Severity");
  }

  kindSelect(): Locator {
    return this.fieldCombobox("Kind");
  }

  webhookUrlInput(): Locator {
    return this.mainPanel()
      .getByRole("textbox", { name: /Slack webhook URL|Webhook URL/i })
      .or(this.page.getByPlaceholder(ALERTS_COPY.slackUrlPlaceholder))
      .first();
  }

  defaultChannelCheckbox(): Locator {
    return this.mainPanel()
      .getByRole("checkbox", { name: ALERTS_COPY.defaultChannelLabel })
      .or(this.page.getByLabel(ALERTS_COPY.defaultChannelLabel));
  }

  async isRulesEmptyState(): Promise<boolean> {
    const visible = await this.page
      .getByText(ALERTS_COPY.rulesEmpty)
      .isVisible({ timeout: 3_000 })
      .catch(() => false);
    if (visible) return true;

    if (await this.rulesTab().isVisible({ timeout: 2_000 }).catch(() => false)) {
      await this.rulesTab().click();
    }
    return this.page
      .getByText(ALERTS_COPY.rulesEmpty)
      .isVisible({ timeout: 5_000 })
      .catch(() => false);
  }

  async isChannelsEmptyState(): Promise<boolean> {
    await this.channelsTab().click();
    return this.page
      .getByText(ALERTS_COPY.channelsEmpty)
      .isVisible({ timeout: 5_000 })
      .catch(() => false);
  }

  async expectRulesTabLoaded() {
    if (await this.rulesTab().isVisible({ timeout: 2_000 }).catch(() => false)) {
      await this.rulesTab().click();
    }
    await expect(this.page.getByRole("heading", { name: /^Rules$/i })).toBeVisible({
      timeout: 15_000,
    });
  }

  async expectChannelsTabLoaded() {
    await this.channelsTab().click();
    await expect(this.page.getByRole("heading", { name: /^Channels$/i })).toBeVisible({
      timeout: 15_000,
    });
  }

  async expectRulesEmptyState() {
    if (await this.rulesTab().isVisible({ timeout: 2_000 }).catch(() => false)) {
      await this.rulesTab().click();
    }
    await expect(this.page.getByText(ALERTS_COPY.rulesEmpty)).toBeVisible({
      timeout: 15_000,
    });
    await expect(this.page.getByText(ALERTS_COPY.eventsEmpty)).toBeVisible();
  }

  async expectChannelsEmptyState() {
    await this.channelsTab().click();
    await expect(this.page.getByText(ALERTS_COPY.channelsEmpty)).toBeVisible({
      timeout: 15_000,
    });
    await expect(this.page.getByText(ALERTS_COPY.channelsHint).first()).toBeVisible();
  }

  async clickNewRule() {
    if (await this.newRuleButton().isVisible({ timeout: 3_000 }).catch(() => false)) {
      await this.newRuleButton().click();
    }
    await this.expectCreateRuleFormVisible();
  }

  async clickAddChannel() {
    await this.channelsTab().click();
    await this.addChannelButton().click({ timeout: 15_000 });
    await this.expectAddChannelFormVisible();
  }

  async expectCreateRuleFormVisible() {
    await expect(this.createRuleButton()).toBeVisible({ timeout: 15_000 });
    await expect(this.metricSelect()).toBeVisible();
    await expect(this.valueInput()).toBeVisible();
    await expect(this.severitySelect()).toBeVisible();
  }

  async expectAddChannelFormVisible() {
    await expect(this.saveChannelButton()).toBeVisible({ timeout: 15_000 });
    await expect(this.kindSelect()).toBeVisible();
    await expect(this.nameInput()).toBeVisible();
  }

  async fillCreateRule(input: {
    name: string;
    metric?: string;
    operator?: string;
    value?: string;
    severity?: string;
  }) {
    await this.nameInput().fill(input.name);
    if (input.metric) await this.selectFieldOption("Metric", input.metric);
    if (input.operator) await this.selectFieldOption("Operator", input.operator);
    if (input.value) await this.valueInput().fill(input.value);
    if (input.severity) await this.selectFieldOption("Severity", input.severity);
  }

  async fillAddChannel(input: {
    name: string;
    kind?: string;
    webhookUrl?: string;
    defaultChannel?: boolean;
  }) {
    if (input.kind) await this.selectFieldOption("Kind", input.kind);
    await this.nameInput().fill(input.name);
    if (input.webhookUrl) {
      const url = this.webhookUrlInput();
      if (await url.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await url.fill(input.webhookUrl);
      }
    }
    if (input.defaultChannel) {
      const checkbox = this.defaultChannelCheckbox();
      if (!(await checkbox.isChecked().catch(() => false))) {
        await checkbox.check();
      }
    }
  }

  async submitCreateRule() {
    await this.createRuleButton().click();
  }

  async submitSaveChannel() {
    await this.saveChannelButton().click();
  }

  async cancelForm() {
    await this.cancelButton().click();
  }

  async expectCreateBlocked() {
    await expect(this.createRuleButton()).toBeVisible();
    await expect(this.createRuleButton()).toBeEnabled();
  }

  async expectNameFieldInvalid() {
    const invalid = await this.nameInput().evaluate(
      (el) => !(el as HTMLInputElement).validity.valid,
    );
    expect(invalid).toBe(true);
  }

  async expectSaveChannelBlocked() {
    await expect(this.saveChannelButton()).toBeVisible();
    await this.expectNameFieldInvalid();
  }
}
