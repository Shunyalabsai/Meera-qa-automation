import { test, expect } from "@playwright/test";
import {
  openWebhooks,
  hasAnySubscribeButton,
  hasEnabledQuickApplyCheckboxes,
} from "../../../../helpers/webhooks.helper";
import { skipEnvPrecondition } from "../../../../helpers/skip";
import {
  WEBHOOKS_SAMPLES,
  WEBHOOK_SECRET_MIN_LENGTH,
} from "../../../../data/webhooks-data";

test.describe("SETTINGS › Webhooks — Negative @journey @new-user @webhooks @negative", () => {
  test("TC-IN-N101 @high @negative — Invalid webhook URL rejected on quick apply", async ({
    page,
  }) => {
    test.skip(
      !(await hasEnabledQuickApplyCheckboxes(page)),
      "[env-precondition] All quick-apply events already subscribed — checkboxes disabled",
    );
    const webhooks = await openWebhooks(page);
    await webhooks.fillQuickApply(
      WEBHOOKS_SAMPLES.invalidUrl,
      WEBHOOKS_SAMPLES.validSecret,
    );
    await webhooks.eventCheckbox("call.connected").first().check();
    await webhooks.clickApply();
    await expect(
      page.getByText(/invalid|URL|Fix the highlighted|http/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("TC-WH-N102 @high @negative — Empty webhook URL blocked on quick apply", async ({
    page,
  }, testInfo) => {
    const webhooks = await openWebhooks(page);
    if (!(await webhooks.hasEnabledQuickApplyCheckboxes())) {
      skipEnvPrecondition(
        testInfo,
        "All quick-apply events already subscribed — checkboxes disabled",
      );
      return;
    }

    await webhooks.quickApplySecretInput().fill(WEBHOOKS_SAMPLES.validSecret);
    await webhooks.checkFirstEnabledQuickApplyEvent();
    // UI blocks submit silently: Apply stays disabled; no alert toast for empty URL.
    await webhooks.expectQuickApplyBlockedForEmptyUrl();
  });

  test("TC-WH-N103 @high @negative — Secret shorter than 16 chars rejected on quick apply", async ({
    page,
  }, testInfo) => {
    const webhooks = await openWebhooks(page);
    if (!(await webhooks.hasEnabledQuickApplyCheckboxes())) {
      skipEnvPrecondition(
        testInfo,
        `Cannot test secret length (requires ≥ ${WEBHOOK_SECRET_MIN_LENGTH} chars) — all quick-apply events already subscribed on staging`,
      );
      return;
    }

    await webhooks.fillQuickApply(
      WEBHOOKS_SAMPLES.validUrl,
      WEBHOOKS_SAMPLES.shortSecret,
    );
    await webhooks.checkFirstEnabledQuickApplyEvent();
    // UI blocks submit silently: Apply stays disabled; no alert toast for under-min secret.
    await webhooks.expectQuickApplyBlockedForShortSecret();
  });

  test("TC-WH-N104 @medium @negative — Apply with zero events selected blocked", async ({
    page,
  }) => {
    const webhooks = await openWebhooks(page);
    await webhooks.fillQuickApply(
      WEBHOOKS_SAMPLES.validUrl,
      WEBHOOKS_SAMPLES.validSecret,
    );
    await webhooks.clearButton().click();
    await webhooks.expectApplyBlockedWithZeroEvents();
  });

  test("TC-WH-N105 @high @negative — Invalid URL rejected on per-event Save subscription", async ({
    page,
  }) => {
    test.skip(
      !(await hasAnySubscribeButton(page)),
      "[env-precondition] Events already subscribed — Subscribe flow not available",
    );
    const webhooks = await openWebhooks(page);
    await webhooks.clickSubscribeForEvent("call.connected");
    await webhooks.fillPerEventSubscription(
      WEBHOOKS_SAMPLES.invalidUrl,
      WEBHOOKS_SAMPLES.validSecret,
    );
    await webhooks.clickSaveSubscription();
    await expect(
      page.getByText(/invalid|URL|Fix the highlighted|http/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("TC-WH-N106 @medium @negative — Empty secret blocked on per-event Save subscription", async ({
    page,
  }) => {
    test.skip(
      !(await hasAnySubscribeButton(page)),
      "[env-precondition] Events already subscribed — Subscribe flow not available",
    );
    const webhooks = await openWebhooks(page);
    await webhooks.clickSubscribeForEvent("call.completed");
    await webhooks.perEventUrlInput().fill(WEBHOOKS_SAMPLES.validUrl);
    await webhooks.clickSaveSubscription();
    await expect(
      page.getByText(/required|secret|16|Fix the highlighted/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("TC-WH-N107 @medium @negative — Short secret rejected on per-event Save subscription", async ({
    page,
  }, testInfo) => {
    test.skip(
      !(await hasAnySubscribeButton(page)),
      "[env-precondition] Events already subscribed — Subscribe flow not available",
    );
    const webhooks = await openWebhooks(page);
    await webhooks.clickSubscribeForEvent("call.failed");
    await webhooks.fillPerEventSubscription(
      WEBHOOKS_SAMPLES.validUrl,
      WEBHOOKS_SAMPLES.shortSecret,
    );
    // UI blocks submit silently: Save disabled, no alert — secret is under min length.
    await webhooks.expectPerEventSaveBlockedForShortSecret();
  });

  test("TC-WH-N108 @medium @negative — Custom event Create blocked with empty event type", async ({
    page,
  }) => {
    const webhooks = await openWebhooks(page);
    await webhooks.clickCustomEventLink();
    await webhooks.fillCustomEvent(
      "",
      WEBHOOKS_SAMPLES.validUrl,
      WEBHOOKS_SAMPLES.validSecret,
    );
    await expect(webhooks.createCustomEventButton()).toBeDisabled();
  });

  test("TC-WH-N109 @low @negative — Invalid webhooks sub-route handled gracefully", async ({
    page,
  }) => {
    await page.goto("/vap/admin/webhooks/invalid-path");
    await expect(
      page.getByText(/404|not found|Webhook/i).first(),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("TC-IN-202 @critical @security @manual — SSRF webhook to internal IP", async () => {
    test.skip(true, "Manual: set webhook to 169.254.x.x and verify blocked");
  });

  test("TC-VC-204 @critical @security @manual — SSRF via webhook callback URL", async () => {
    test.skip(true, "Manual: SSRF test on call webhook callback");
  });

  test("TC-IN-201 @high @security @manual — Webhook signature validation", async () => {
    test.skip(true, "Manual: verify HMAC signature on webhook payload");
  });

  test("TC-IN-203 @high @security @manual — API key in URL parameter", async () => {
    test.skip(true, "Manual: verify API key not accepted in query string");
  });

  test("TC-IN-204 @high @security @manual — Overprivileged API key scope", async () => {
    test.skip(true, "Manual: verify scoped API key permissions");
  });
});
