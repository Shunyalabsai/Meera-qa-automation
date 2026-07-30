import { test, expect } from "@playwright/test";
import { openWebhooks } from "../../../../helpers/webhooks.helper";
import {
  E2E_REAL_WEBHOOK_URL,
  E2E_REAL_WEBHOOK_SECRET,
} from "../../../../data/test-fixtures";
import {
  webhookSiteToken,
  isWebhookSiteUrl,
  getWebhookSiteRequests,
  clearWebhookSiteRequests,
  waitForWebhookSiteDelivery,
} from "../../../../helpers/webhook-site";

/**
 * End-to-end webhook tests using the REAL endpoint from .env (Webhook_url +
 * shared_secret). Unlike the UI specs, these actually create subscriptions
 * that point at your inbox so deliveries can be verified.
 *
 *   Webhook_url=https://webhook.site/<token>
 *   shared_secret=<≥16 chars>
 *
 * Trigger an actual call to fire delivery (set E2E_WEBHOOK_TRIGGER=true and make
 * a call during the poll window, or run after a recent call).
 */
test.describe("SETTINGS › Webhooks — E2E delivery @webhooks @e2e @serial", () => {
  test.describe.configure({ mode: "serial" });

  test.skip(
    !E2E_REAL_WEBHOOK_URL || !E2E_REAL_WEBHOOK_SECRET,
    "[env-precondition] Set Webhook_url + shared_secret in .env to run real webhook delivery tests",
  );

  test("TC-WH-L001 @high @positive — Apply real webhook endpoint creates subscriptions", async ({
    page,
  }) => {
    const webhooks = await openWebhooks(page);

    const subscribed = await webhooks.applyToAllEvents(
      E2E_REAL_WEBHOOK_URL,
      E2E_REAL_WEBHOOK_SECRET,
    );

    expect(
      subscribed,
      `At least one event should be subscribed to ${E2E_REAL_WEBHOOK_URL}`,
    ).toBeGreaterThan(0);

    await expect(
      webhooks.subscriptionUrlRows(E2E_REAL_WEBHOOK_URL).first(),
    ).toBeVisible();
    await expect(webhooks.recentDeliveriesSection()).toBeVisible();
  });

  test("TC-WH-L004 @high @positive — Platform delivers to the configured endpoint", async ({
    page,
  }) => {
    test.skip(
      !isWebhookSiteUrl(E2E_REAL_WEBHOOK_URL),
      "[env-precondition] Delivery verification needs a webhook.site Webhook_url",
    );
    const triggerEnabled = process.env.E2E_WEBHOOK_TRIGGER === "true";
    test.skip(
      !triggerEnabled,
      "[manual-trigger] Set E2E_WEBHOOK_TRIGGER=true and place a call during the poll window to verify delivery",
    );

    const token = webhookSiteToken(E2E_REAL_WEBHOOK_URL)!;

    // Ensure subscriptions exist, then start from a clean inbox.
    const webhooks = await openWebhooks(page);
    await webhooks.applyToAllEvents(E2E_REAL_WEBHOOK_URL, E2E_REAL_WEBHOOK_SECRET);
    await clearWebhookSiteRequests(token);

    const baseline = (await getWebhookSiteRequests(token)).length;

    // A real call must fire during this window (call.triggered is emitted as
    // soon as the call row is created — see webhooks-agent.md).
    const delivered = await waitForWebhookSiteDelivery(token, {
      sinceCount: baseline,
      timeoutMs: 180_000,
    });

    expect(
      delivered.length,
      "Expected the platform to deliver at least one webhook to webhook.site",
    ).toBeGreaterThan(baseline);

    const latest = delivered[0];
    expect(latest.method.toUpperCase()).toBe("POST");

    // Signed payloads carry an HMAC signature header derived from shared_secret.
    const headerKeys = Object.keys(latest.headers || {}).map((k) =>
      k.toLowerCase(),
    );
    const hasSignature = headerKeys.some((k) => /signature|hmac|x-.*sign/i.test(k));
    expect(
      hasSignature,
      `Delivery should include a signature header. Got: ${headerKeys.join(", ")}`,
    ).toBe(true);
  });
});
