import { test, expect } from "@playwright/test";
import { openWebhooks } from "../../../../../helpers/webhooks.helper";
import { WEBHOOKS_COPY, WEBHOOK_EVENTS } from "../../../../../data/webhooks-data";

test.describe("SETTINGS › Webhooks — Main UI @journey @existing-user @webhooks", () => {
  test("TC-WH-001 @high @ui — Webhooks heading and subtitle visible", async ({
    page,
  }) => {
    const webhooks = await openWebhooks(page);
    await webhooks.expectPageHeader();
  });

  test("TC-WH-002 @high @ui — Sidebar Webhooks nav link visible", async ({
    page,
  }) => {
    const webhooks = await openWebhooks(page);
    await webhooks.expectSidebarLinkVisible();
  });

  test("TC-WH-003 @high @ui — Quick apply section with URL secret and event checkboxes", async ({
    page,
  }) => {
    const webhooks = await openWebhooks(page);
    await webhooks.expectQuickApplySection();
    await expect(page.getByText(WEBHOOKS_COPY.quickApplyHint).first()).toBeVisible();
  });

  test("TC-WH-004 @high @ui — All standard event checkboxes listed in quick apply", async ({
    page,
  }) => {
    const webhooks = await openWebhooks(page);
    for (const event of WEBHOOK_EVENTS) {
      await expect(webhooks.eventCheckbox(event).first()).toBeVisible();
    }
  });

  test("TC-WH-005 @high @ui — Event subscriptions section lists all events", async ({
    page,
  }) => {
    const webhooks = await openWebhooks(page);
    await webhooks.expectEventSubscriptionsSection();
  });

  test("TC-WH-006 @medium @ui — Each event row shows subscription status badge", async ({
    page,
  }) => {
    const webhooks = await openWebhooks(page);
    const section = webhooks.eventSubscriptionsSection();
    for (const event of WEBHOOK_EVENTS) {
      await expect(section.getByText(/subscribed|not subscribed/i).first()).toBeVisible();
      await expect(section.getByText(event, { exact: true }).first()).toBeVisible();
    }
  });

  test("TC-WH-007 @medium @ui — Subscribe or manage control visible on each event row", async ({
    page,
  }) => {
    const webhooks = await openWebhooks(page);
    for (const event of WEBHOOK_EVENTS) {
      await expect(webhooks.manageButtonForEvent(event)).toBeVisible();
    }
  });

  test("TC-WH-008 @medium @ui — Recent deliveries section visible", async ({
    page,
  }) => {
    await openWebhooks(page);
    await expect(page.getByText(WEBHOOKS_COPY.recentDeliveries).first()).toBeVisible();
  });

  test("TC-WH-009 @medium @ui — Custom event type link visible", async ({
    page,
  }) => {
    const webhooks = await openWebhooks(page);
    await expect(webhooks.customEventLink()).toBeVisible();
  });
});
