import { test, expect } from "@playwright/test";
import {
  openWebhooks,
  hasAnySubscribeButton,
} from "../../../../../helpers/webhooks.helper";
import { WEBHOOK_EVENTS, WEBHOOKS_COPY, WEBHOOKS_SAMPLES } from "../../../../../data/webhooks-data";

test.describe("SETTINGS › Webhooks — Event subscriptions @journey @existing-user @webhooks @positive", () => {
  test("TC-WH-020 @high @positive — Subscribe on call.triggered expands URL and secret form", async ({
    page,
  }) => {
    test.skip(
      !(await hasAnySubscribeButton(page)),
      "[env-precondition] Events already subscribed — Subscribe flow not available",
    );
    const webhooks = await openWebhooks(page);
    await webhooks.clickSubscribeForEvent("call.triggered");
    await expect(webhooks.perEventUrlInput()).toBeVisible();
    await expect(webhooks.perEventSecretInput()).toBeVisible();
    await expect(webhooks.saveSubscriptionButton()).toBeVisible();
  });

  test("TC-WH-021 @high @positive — Subscribe on call.connected expands subscription form", async ({
    page,
  }) => {
    test.skip(
      !(await hasAnySubscribeButton(page)),
      "[env-precondition] Events already subscribed — Subscribe flow not available",
    );
    const webhooks = await openWebhooks(page);
    await webhooks.clickSubscribeForEvent("call.connected");
    await expect(webhooks.saveSubscriptionButton()).toBeVisible();
    await expect(webhooks.cancelSubscriptionButton()).toBeVisible();
  });

  test("TC-WH-022 @medium @positive — Per-event URL field accepts HTTPS value", async ({
    page,
  }) => {
    test.skip(
      !(await hasAnySubscribeButton(page)),
      "[env-precondition] Events already subscribed — Subscribe flow not available",
    );
    const webhooks = await openWebhooks(page);
    await webhooks.clickSubscribeForEvent("call.completed");
    await webhooks.fillPerEventSubscription(
      WEBHOOKS_SAMPLES.validUrl,
      WEBHOOKS_SAMPLES.validSecret,
    );
    await expect(webhooks.perEventUrlInput()).toHaveValue(WEBHOOKS_SAMPLES.validUrl);
  });

  test("TC-WH-023 @medium @positive — Cancel collapses expanded subscription form", async ({
    page,
  }) => {
    test.skip(
      !(await hasAnySubscribeButton(page)),
      "[env-precondition] Events already subscribed — Subscribe flow not available",
    );
    const webhooks = await openWebhooks(page);
    await webhooks.clickSubscribeForEvent("call.failed");
    await webhooks.cancelSubscriptionButton().click();
    await expect(webhooks.saveSubscriptionButton()).not.toBeVisible({
      timeout: 10_000,
    });
    await expect(webhooks.subscribeButtonForEvent("call.failed")).toBeVisible();
  });

  test("TC-WH-024 @medium @positive — Save subscription enabled when URL and secret filled", async ({
    page,
  }) => {
    test.skip(
      !(await hasAnySubscribeButton(page)),
      "[env-precondition] Events already subscribed — Subscribe flow not available",
    );
    const webhooks = await openWebhooks(page);
    await webhooks.clickSubscribeForEvent("intent.captured");
    await webhooks.fillPerEventSubscription(
      WEBHOOKS_SAMPLES.validUrl,
      WEBHOOKS_SAMPLES.validSecret,
    );
    await expect(webhooks.saveSubscriptionButton()).toBeEnabled();
  });

  test("TC-WH-025 @medium @positive — Custom event link reveals Custom event type section", async ({
    page,
  }) => {
    const webhooks = await openWebhooks(page);
    await webhooks.clickCustomEventLink();
    await webhooks.expectCustomEventSectionVisible();
    await expect(page.getByText(WEBHOOKS_COPY.customEventHint).first()).toBeVisible();
  });

  test("TC-WH-026 @medium @positive — Custom event type field accepts arbitrary event name", async ({
    page,
  }) => {
    const webhooks = await openWebhooks(page);
    await webhooks.clickCustomEventLink();
    await webhooks.customEventTypeInput().fill(WEBHOOKS_SAMPLES.customEventType);
    await expect(webhooks.customEventTypeInput()).toHaveValue(
      WEBHOOKS_SAMPLES.customEventType,
    );
  });

  test("TC-WH-027 @medium @positive — Custom event Cancel hides the section", async ({
    page,
  }) => {
    const webhooks = await openWebhooks(page);
    await webhooks.clickCustomEventLink();
    await webhooks.cancelCustomEventButton().click();
    await expect(
      page.getByRole("heading", { name: /^Custom event type$/i }),
    ).not.toBeVisible({ timeout: 10_000 });
  });

  test("TC-WH-028 @medium @positive — Create custom event enabled when all fields filled", async ({
    page,
  }) => {
    const webhooks = await openWebhooks(page);
    await webhooks.clickCustomEventLink();
    await webhooks.fillCustomEvent(
      WEBHOOKS_SAMPLES.customEventType,
      WEBHOOKS_SAMPLES.validUrl,
      WEBHOOKS_SAMPLES.validSecret,
    );
    await expect(webhooks.createCustomEventButton()).toBeEnabled();
  });

  test("TC-IN-004 @high @positive — Per-event manage controls available for all events", async ({
    page,
  }) => {
    const webhooks = await openWebhooks(page);
    for (const event of WEBHOOK_EVENTS) {
      await expect(webhooks.manageButtonForEvent(event)).toBeVisible();
    }
  });

});
