import { test, expect } from "@playwright/test";
import {
  openWebhooks,
  hasAnySubscribeButton,
  hasEnabledQuickApplyCheckboxes,
} from "../../../../../helpers/webhooks.helper";
import { WEBHOOKS_SAMPLES } from "../../../../../data/webhooks-data";
import { gotoApp } from "../../../../../helpers/navigate";

test.describe("SETTINGS › Webhooks — CTA functional @journey @existing-user @webhooks @cta", () => {
  test("CTA-WH-001 @high @cta — Select all link toggles all event checkboxes", async ({
    page,
  }) => {
    test.skip(
      !(await hasEnabledQuickApplyCheckboxes(page)),
      "[env-precondition] All quick-apply events already subscribed — checkboxes disabled",
    );
    const webhooks = await openWebhooks(page);
    await webhooks.selectAllButton().click();
    await expect(webhooks.applyButton()).toHaveText(/Apply to [1-9]/);
  });

  test("CTA-WH-002 @high @cta — Clear link unchecks all event checkboxes", async ({
    page,
  }) => {
    const webhooks = await openWebhooks(page);
    await webhooks.selectAllButton().click();
    await webhooks.clearButton().click();
    await expect(webhooks.applyButton()).toHaveText(/Apply to 0 events/i);
  });

  test("CTA-WH-003 @high @cta — Apply button enabled when quick apply form complete", async ({
    page,
  }) => {
    test.skip(
      !(await hasEnabledQuickApplyCheckboxes(page)),
      "[env-precondition] All quick-apply events already subscribed — checkboxes disabled",
    );
    const webhooks = await openWebhooks(page);
    await webhooks.fillQuickApply(
      WEBHOOKS_SAMPLES.validUrl,
      WEBHOOKS_SAMPLES.validSecret,
    );
    await webhooks.eventCheckbox("call.triggered").first().check();
    await expect(webhooks.applyButton()).toBeEnabled();
  });

  test("CTA-WH-004 @high @cta — Subscribe button expands per-event form", async ({
    page,
  }) => {
    test.skip(
      !(await hasAnySubscribeButton(page)),
      "[env-precondition] Events already subscribed — Subscribe flow not available",
    );
    const webhooks = await openWebhooks(page);
    await webhooks.clickSubscribeForEvent("call.connected");
    await expect(webhooks.saveSubscriptionButton()).toBeVisible();
  });

  test("CTA-WH-005 @high @cta — Save subscription enabled when per-event form complete", async ({
    page,
  }) => {
    test.skip(
      !(await hasAnySubscribeButton(page)),
      "[env-precondition] Events already subscribed — Subscribe flow not available",
    );
    const webhooks = await openWebhooks(page);
    await webhooks.clickSubscribeForEvent("call.triggered");
    await webhooks.fillPerEventSubscription(
      WEBHOOKS_SAMPLES.validUrl,
      WEBHOOKS_SAMPLES.validSecret,
    );
    await expect(webhooks.saveSubscriptionButton()).toBeEnabled();
  });

  test("CTA-WH-006 @medium @cta — Cancel button collapses per-event subscription form", async ({
    page,
  }) => {
    test.skip(
      !(await hasAnySubscribeButton(page)),
      "[env-precondition] Events already subscribed — Subscribe flow not available",
    );
    const webhooks = await openWebhooks(page);
    await webhooks.clickSubscribeForEvent("call.failed");
    await webhooks.cancelSubscriptionButton().click();
    await expect(webhooks.subscribeButtonForEvent("call.failed")).toBeVisible();
  });

  test("CTA-WH-007 @high @cta — Subscribe to a custom event type link opens section", async ({
    page,
  }) => {
    const webhooks = await openWebhooks(page);
    await webhooks.clickCustomEventLink();
    await webhooks.expectCustomEventSectionVisible();
  });

  test("CTA-WH-008 @high @cta — Create enabled when custom event form complete", async ({
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

  test("CTA-WH-009 @medium @cta — Cancel button hides custom event section", async ({
    page,
  }) => {
    const webhooks = await openWebhooks(page);
    await webhooks.clickCustomEventLink();
    await webhooks.cancelCustomEventButton().click();
    await expect(webhooks.customEventTypeInput()).not.toBeVisible({
      timeout: 10_000,
    });
  });

  test("CTA-WH-010 @medium @cta — Sidebar Webhooks link navigates to webhooks page", async ({
    page,
  }) => {
    await gotoApp(page, "billing");
    await page.getByRole("link", { name: /^Webhooks$/i }).click();
    await expect(page).toHaveURL(/\/webhooks/, { timeout: 30_000 });
    await expect(page.getByRole("heading", { name: /^Webhooks$/i })).toBeVisible();
  });
});
