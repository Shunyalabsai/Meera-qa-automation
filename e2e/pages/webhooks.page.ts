/** SETTINGS › Webhooks — per-event outbound delivery configuration. */
import { Page, expect, Locator } from "@playwright/test";
import { gotoApp, waitForLoadingToClear } from "../helpers/navigate";
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
    await this.waitForSubscriptionsSettled();
  }

  /**
   * Quick-apply checkboxes render ENABLED on first paint, then the subscription
   * fetch disables the events that are already subscribed. Reading the
   * enabled/disabled state before that fetch resolves makes the env-precondition
   * guards (hasEnabledQuickApplyCheckboxes / hasAnySubscribeButton) flap and the
   * test proceeds into a now-disabled control. Wait until every event row shows
   * a "subscribed · …" or "not subscribed" badge so the state is final.
   */
  async waitForSubscriptionsSettled(): Promise<void> {
    await waitForLoadingToClear(this.page);
    try {
      await expect
        .poll(
          async () =>
            this.eventSubscriptionsSection()
              .getByText(/not subscribed|subscribed ·/i)
              .count(),
          { timeout: 20_000, intervals: [500, 750, 1_000] },
        )
        .toBeGreaterThanOrEqual(WEBHOOK_EVENTS.length);
    } catch {
      // Badges still not fully rendered after the timeout — guards will read the
      // best-available live state rather than blocking the test outright.
    }
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

  /**
   * Read a per-event boolean signature repeatedly until it stops changing.
   * The quick-apply controls render in their default state on first paint and
   * then flip once the subscription fetch resolves, so a single read is racy.
   * Requiring two consecutive identical reads guarantees the final state.
   */
  private async readUntilStable(
    read: () => Promise<boolean[]>,
    { attempts = 12, gapMs = 600 } = {},
  ): Promise<boolean[]> {
    let prevSig = "";
    let last: boolean[] = [];
    for (let i = 0; i < attempts; i++) {
      last = await read();
      const sig = last.map((s) => (s ? "1" : "0")).join("");
      if (sig === prevSig) return last;
      prevSig = sig;
      await this.page.waitForTimeout(gapMs);
    }
    return last;
  }

  async hasEnabledQuickApplyCheckboxes(): Promise<boolean> {
    await this.waitForSubscriptionsSettled();
    const states = await this.readUntilStable(async () => {
      const result: boolean[] = [];
      for (const event of WEBHOOK_EVENTS) {
        const box = this.eventCheckbox(event).first();
        const visible = await box
          .isVisible({ timeout: 1_000 })
          .catch(() => false);
        result.push(visible ? await box.isEnabled().catch(() => false) : false);
      }
      return result;
    });
    return states.some(Boolean);
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
    await this.waitForSubscriptionsSettled();
    const states = await this.readUntilStable(async () => {
      const result: boolean[] = [];
      for (const event of WEBHOOK_EVENTS) {
        result.push(
          await this.subscribeButtonForEvent(event)
            .isVisible({ timeout: 500 })
            .catch(() => false),
        );
      }
      return result;
    });
    return states.some(Boolean);
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

  async clickSaveSubscription() {
    await this.saveSubscriptionButton().click();
  }

  async expectSidebarLinkVisible() {
    await expect(this.page.getByRole("link", { name: /^Webhooks$/i })).toBeVisible();
  }

  /**
   * Subscribed events render as "{event} subscribed · enabled" with a
   * destination paragraph "→ {url}". Counting the destination rows for a given
   * URL is the most robust signal that subscriptions point at our endpoint.
   */
  subscriptionUrlRows(url: string): Locator {
    return this.eventSubscriptionsSection().getByText(`→ ${url}`);
  }

  /** Any "· enabled" subscription badge in the Event subscriptions list. */
  subscribedBadges(): Locator {
    return this.eventSubscriptionsSection().getByText(/subscribed · enabled/i);
  }

  async countSubscribed(): Promise<number> {
    return this.subscribedBadges().count();
  }

  async countSubscribedToUrl(url: string): Promise<number> {
    return this.subscriptionUrlRows(url).count();
  }

  recentDeliveriesSection(): Locator {
    return this.page
      .getByRole("heading", { name: /^Recent deliveries$/i })
      .locator("xpath=..");
  }

  /**
   * Quick-apply the given endpoint to every currently-enabled event, then Apply.
   * Idempotent: when all events are already subscribed the quick-apply
   * checkboxes are disabled and we simply verify the existing subscriptions.
   * Returns the number of events subscribed to `url`.
   */
  async applyToAllEvents(url: string, secret: string): Promise<number> {
    await this.fillQuickApply(url, secret);
    if (await this.hasEnabledQuickApplyCheckboxes()) {
      await this.selectAllButton().click();
      await expect(this.applyButton()).toBeEnabled();
      await this.clickApply();
    }
    await expect(this.subscriptionUrlRows(url).first()).toBeVisible({
      timeout: 20_000,
    });
    return this.countSubscribedToUrl(url);
  }
}
