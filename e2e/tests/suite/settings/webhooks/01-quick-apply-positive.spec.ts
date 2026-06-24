import { test, expect } from "@playwright/test";
import {
  openWebhooks,
  hasEnabledQuickApplyCheckboxes,
} from "../../../../helpers/webhooks.helper";
import { skipEnvPrecondition } from "../../../../helpers/skip";
import { WEBHOOKS_SAMPLES, WEBHOOK_EVENTS } from "../../../../data/webhooks-data";

test.describe("SETTINGS › Webhooks — Quick apply @journey @new-user @webhooks @positive", () => {
  test("TC-IN-001 @high @positive — Webhooks page loads with quick apply controls", async ({
    page,
  }) => {
    const webhooks = await openWebhooks(page);
    await webhooks.expectQuickApplySection();
    await expect(page).toHaveURL(/\/webhooks/);
  });

  test("TC-WH-010 @high @positive — Quick apply URL accepts HTTPS URL", async ({
    page,
  }) => {
    const webhooks = await openWebhooks(page);
    await webhooks.quickApplyUrlInput().fill(WEBHOOKS_SAMPLES.validUrl);
    await expect(webhooks.quickApplyUrlInput()).toHaveValue(WEBHOOKS_SAMPLES.validUrl);
  });

  test("TC-WH-011 @high @positive — Shared secret field accepts 16+ character value", async ({
    page,
  }) => {
    const webhooks = await openWebhooks(page);
    await webhooks.quickApplySecretInput().fill(WEBHOOKS_SAMPLES.validSecret);
    await expect(webhooks.quickApplySecretInput()).toHaveValue(
      WEBHOOKS_SAMPLES.validSecret,
    );
  });

  test("TC-WH-012 @medium @positive — Select all checks every event checkbox", async ({
    page,
  }, testInfo) => {
    test.skip(
      !(await hasEnabledQuickApplyCheckboxes(page)),
      "[env-precondition] All quick-apply events already subscribed — checkboxes disabled",
    );
    const webhooks = await openWebhooks(page);
    await webhooks.selectAllButton().click();
    for (const event of WEBHOOK_EVENTS) {
      await expect(webhooks.eventCheckbox(event).first()).toBeChecked();
    }
  });

  test("TC-WH-013 @medium @positive — Clear unchecks all event checkboxes", async ({
    page,
  }, testInfo) => {
    test.skip(
      !(await hasEnabledQuickApplyCheckboxes(page)),
      "[env-precondition] All quick-apply events already subscribed — checkboxes disabled",
    );
    const webhooks = await openWebhooks(page);
    await webhooks.selectAllButton().click();
    await webhooks.clearButton().click();
    for (const event of WEBHOOK_EVENTS) {
      await expect(webhooks.eventCheckbox(event).first()).not.toBeChecked();
    }
  });

  test("TC-WH-014 @medium @positive — Selection count updates when events checked", async ({
    page,
  }, testInfo) => {
    test.skip(
      !(await hasEnabledQuickApplyCheckboxes(page)),
      "[env-precondition] All quick-apply events already subscribed — checkboxes disabled",
    );
    const webhooks = await openWebhooks(page);
    await webhooks.eventCheckbox("call.connected").first().check();
    await expect(page.getByText(/1 selected.*1 will be created/i)).toBeVisible({
      timeout: 10_000,
    });
  });

  test("TC-WH-015 @medium @positive — Apply button label reflects selected event count", async ({
    page,
  }) => {
    test.skip(
      !(await hasEnabledQuickApplyCheckboxes(page)),
      "[env-precondition] All quick-apply events already subscribed — checkboxes disabled",
    );
    const webhooks = await openWebhooks(page);
    await webhooks.selectAllButton().click();
    await expect(webhooks.applyButton()).toHaveText(/Apply to \d+ events/i);
  });

  test("TC-WH-016 @medium @positive — Apply button enabled when URL secret and event selected", async ({
    page,
  }, testInfo) => {
    test.skip(
      !(await hasEnabledQuickApplyCheckboxes(page)),
      "[env-precondition] All quick-apply events already subscribed — checkboxes disabled",
    );
    const webhooks = await openWebhooks(page);
    await webhooks.fillQuickApply(
      WEBHOOKS_SAMPLES.validUrl,
      WEBHOOKS_SAMPLES.validSecret,
    );
    await webhooks.eventCheckbox("call.connected").first().check();
    await expect(webhooks.applyButton()).toBeEnabled();
  });

  test("TC-WH-017 @low @positive — Individual event checkbox toggles independently", async ({
    page,
  }, testInfo) => {
    test.skip(
      !(await hasEnabledQuickApplyCheckboxes(page)),
      "[env-precondition] All quick-apply events already subscribed — checkboxes disabled",
    );
    const webhooks = await openWebhooks(page);
    const box = webhooks.eventCheckbox("call.failed").first();
    await box.check();
    await expect(box).toBeChecked();
    await box.uncheck();
    await expect(box).not.toBeChecked();
  });

  test("TC-IN-002 @high @positive @manual — CRM webhook on call end", async () => {
    test.skip(true, "Manual: configure CRM webhook and complete call");
  });

  test("TC-IN-003 @medium @positive @manual — Zapier/n8n integration", async () => {
    test.skip(true, "Manual: configure Zapier/n8n webhook");
  });
});
