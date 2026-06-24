/** SETTINGS › Webhooks — per-event outbound delivery configuration. */
import { Page, expect, Locator } from "@playwright/test";
import { gotoApp } from "../helpers/navigate";
import {
  WEBHOOKS_COPY,
  WEBHOOK_EVENTS,
  WEBHOOK_SECRET_MIN_LENGTH,
} from "../data/webhooks-data";

export class WebhooksPage {
  constructor(private readonly page: Page) {}

  mainPanel(): Locator {
    return this.page.getByRole("main");
  }

  quickApplySection(): Locator {
    return this.page
      .getByRole("heading", { name: /^Quick apply$/i })
      .locator("xpath=..");
  }

  eventSubscriptionsSection(): Locator {
    return this.page
      .getByRole("heading", { name: /^Event subscriptions$/i })
      .locator("xpath=..");
  }

  async open() {
    await gotoApp(this.page, "admin/webhooks");
    await this.expectPageHeader();
  }

  async expectPageHeader() {
    await expect(
      this.page.getByRole("heading", { name: /^Webhooks$/i }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(this.page.getByText(WEBHOOKS_COPY.subtitle).first()).toBeVisible();
  }

  async expectQuickApplySection() {
    await expect(
      this.page.getByRole("heading", { name: /^Quick apply$/i }),
    ).toBeVisible();
    await expect(this.quickApplyUrlInput()).toBeVisible();
    await expect(this.quickApplySecretInput()).toBeVisible();
    await expect(this.selectAllButton()).toBeVisible();
    await expect(this.clearButton()).toBeVisible();
    await expect(this.applyButton()).toBeVisible();
  }

  async expectEventSubscriptionsSection() {
    await expect(
      this.page.getByRole("heading", { name: /^Event subscriptions$/i }),
    ).toBeVisible();
    for (const event of WEBHOOK_EVENTS) {
      await expect(
        this.eventSubscriptionsSection().getByText(event, { exact: true }).first(),
      ).toBeVisible();
    }
    await expect(this.customEventLink()).toBeVisible();
  }

  quickApplyUrlInput(): Locator {
    return this.mainPanel().getByRole("textbox", { name: /^Webhook URL$/i });
  }

  quickApplySecretInput(): Locator {
    return this.mainPanel().getByRole("textbox", {
      name: /Shared secret/i,
    });
  }

  selectAllButton(): Locator {
    return this.mainPanel().getByRole("button", { name: /^Select all$/i });
  }

  clearButton(): Locator {
    return this.mainPanel().getByRole("button", { name: /^Clear$/i });
  }

  applyButton(): Locator {
    return this.mainPanel().getByRole("button", {
      name: /Apply to \d+ events?/i,
    });
  }

  eventCheckbox(eventName: string): Locator {
    return this.quickApplySection().getByRole("checkbox", {
      name: new RegExp(eventName.replace(".", "\\."), "i"),
    });
  }

  async hasEnabledQuickApplyCheckboxes(): Promise<boolean> {
    for (const event of WEBHOOK_EVENTS) {
      const box = this.eventCheckbox(event).first();
      if (!(await box.isVisible({ timeout: 2_000 }).catch(() => false))) continue;
      if (await box.isEnabled().catch(() => false)) return true;
    }
    return false;
  }

  /** Select the first quick-apply event that is not already subscribed. */
  async checkFirstEnabledQuickApplyEvent(): Promise<string> {
    for (const event of WEBHOOK_EVENTS) {
      const box = this.eventCheckbox(event).first();
      if (!(await box.isEnabled().catch(() => false))) continue;
      await box.check();
      return event;
    }
    throw new Error(
      "No enabled quick-apply event checkbox — all events already subscribed",
    );
  }

  /**
   * Quick apply rejects empty URL by keeping Apply disabled — no alert toast.
   */
  async expectQuickApplyBlockedForEmptyUrl() {
    const url = await this.quickApplyUrlInput().inputValue();
    expect(url.trim(), "URL field should be empty for this negative case").toBe(
      "",
    );

    await expect(
      this.applyButton(),
      "Apply stays disabled when webhook URL is empty — no alert message is shown",
    ).toBeDisabled();

    await expect(this.mainPanel().getByRole("alert")).not.toBeVisible();
    await expect(
      this.mainPanel().getByText(
        /Fix the highlighted|validation failed|required|invalid URL/i,
      ),
    ).not.toBeVisible();
  }

  /**
   * Quick apply rejects secrets shorter than 16 chars by keeping Apply disabled.
   * The UI does not show an alert/toast for this — only the field label hints at the rule.
   */
  async expectQuickApplyBlockedForShortSecret(
    minLength = WEBHOOK_SECRET_MIN_LENGTH,
  ) {
    const secret = await this.quickApplySecretInput().inputValue();
    expect(
      secret.length,
      `Secret "${secret}" is ${secret.length} chars; UI requires ≥ ${minLength} chars`,
    ).toBeLessThan(minLength);

    await expect(
      this.applyButton(),
      `Apply stays disabled when secret is under ${minLength} chars — no alert message is shown`,
    ).toBeDisabled();

    await expect(this.mainPanel().getByRole("alert")).not.toBeVisible();
    await expect(
      this.mainPanel().getByText(
        /Fix the highlighted|validation failed|must be at least \d+ characters/i,
      ),
    ).not.toBeVisible();
  }

  /** Per-event subscribe form rejects secrets shorter than 16 chars without an alert toast. */
  async expectPerEventSaveBlockedForShortSecret(
    minLength = WEBHOOK_SECRET_MIN_LENGTH,
  ) {
    const secret = await this.perEventSecretInput().inputValue();
    expect(
      secret.length,
      `Secret "${secret}" is ${secret.length} chars; UI requires ≥ ${minLength} chars`,
    ).toBeLessThan(minLength);

    await expect(
      this.saveSubscriptionButton(),
      `Save subscription stays disabled when secret is under ${minLength} chars — no alert message is shown`,
    ).toBeDisabled();

    await expect(this.mainPanel().getByRole("alert")).not.toBeVisible();
  }

  async hasAnySubscribeButton(): Promise<boolean> {
    for (const event of WEBHOOK_EVENTS) {
      if (
        await this.subscribeButtonForEvent(event)
          .isVisible({ timeout: 500 })
          .catch(() => false)
      ) {
        return true;
      }
    }
    return false;
  }

  eventRow(eventName: string): Locator {
    const escaped = eventName.replace(".", "\\.");
    return this.mainPanel()
      .locator("div")
      .filter({
        hasText: new RegExp(
          `${escaped}\\s+(?:subscribed|not subscribed)`,
          "i",
        ),
      })
      .first();
  }

  subscribeButtonForEvent(eventName: string): Locator {
    return this.eventRow(eventName).getByRole("button", { name: /^Subscribe$/i });
  }

  manageButtonForEvent(eventName: string): Locator {
    const index = WEBHOOK_EVENTS.indexOf(
      eventName as (typeof WEBHOOK_EVENTS)[number],
    );
    return this.eventSubscriptionsSection()
      .getByRole("button", {
        name: /^Disable$|^Subscribe$|^Edit$|^Manage$/i,
      })
      .nth(Math.max(index, 0));
  }

  async clickSubscribeForEvent(eventName: string) {
    await this.subscribeButtonForEvent(eventName).click();
  }

  perEventUrlInput(): Locator {
    return this.mainPanel()
      .getByRole("textbox", { name: /^URL$/i })
      .last();
  }

  perEventSecretInput(): Locator {
    return this.mainPanel()
      .getByRole("textbox", { name: /Secret.*16 chars/i })
      .last();
  }

  saveSubscriptionButton(): Locator {
    return this.mainPanel().getByRole("button", { name: /Save subscription/i });
  }

  customEventLink(): Locator {
    return this.mainPanel()
      .getByRole("button", { name: /Subscribe to a custom event type/i })
      .or(this.page.getByText(/Subscribe to a custom event type/i))
      .first();
  }

  customEventSection(): Locator {
    return this.page
      .getByRole("heading", { name: /^Custom event type$/i })
      .locator("xpath=..");
  }

  async clickCustomEventLink() {
    await this.customEventLink().click();
  }

  async expectCustomEventSectionVisible() {
    await expect(this.page.getByRole("heading", { name: /^Custom event type$/i })).toBeVisible({
      timeout: 10_000,
    });
    await expect(this.customEventTypeInput()).toBeVisible();
    await expect(this.customEventUrlInput()).toBeVisible();
    await expect(this.customEventSecretInput()).toBeVisible();
    await expect(this.createCustomEventButton()).toBeVisible();
    await expect(this.cancelCustomEventButton()).toBeVisible();
  }

  customEventTypeInput(): Locator {
    return this.customEventSection().getByPlaceholder(/campaign\.exhausted/i);
  }

  customEventUrlInput(): Locator {
    return this.customEventSection().getByPlaceholder("https://your-app/webhook");
  }

  customEventSecretInput(): Locator {
    return this.customEventSection().getByPlaceholder("secret (≥ 16 chars)");
  }

  createCustomEventButton(): Locator {
    return this.customEventSection().getByRole("button", { name: /^Create$/i });
  }

  cancelCustomEventButton(): Locator {
    return this.customEventSection().getByRole("button", { name: /^Cancel$/i });
  }

  cancelSubscriptionButton(): Locator {
    return this.mainPanel().getByRole("button", { name: /^Cancel$/i }).first();
  }

  async fillQuickApply(url: string, secret: string) {
    await this.quickApplyUrlInput().fill(url);
    await this.quickApplySecretInput().fill(secret);
  }

  async fillPerEventSubscription(url: string, secret: string) {
    await this.perEventUrlInput().fill(url);
    await this.perEventSecretInput().fill(secret);
  }

  async fillCustomEvent(type: string, url: string, secret: string) {
    await this.customEventTypeInput().fill(type);
    await this.customEventUrlInput().fill(url);
    await this.customEventSecretInput().fill(secret);
  }

  async clickApply() {
    await this.applyButton().click();
  }

  async expectApplyBlockedWithZeroEvents() {
    await expect(this.applyButton()).toBeDisabled();
  }

  async expectCustomEventTypeInvalid() {
    const invalid = await this.customEventTypeInput().evaluate(
      (el) => !(el as HTMLInputElement).validity.valid,
    );
    expect(invalid).toBe(true);
  }

  async clickSaveSubscription() {
    await this.saveSubscriptionButton().click();
  }

  async clickCreateCustomEvent() {
    await this.createCustomEventButton().click();
  }

  async expectSidebarLinkVisible() {
    await expect(this.page.getByRole("link", { name: /^Webhooks$/i })).toBeVisible();
  }
}
