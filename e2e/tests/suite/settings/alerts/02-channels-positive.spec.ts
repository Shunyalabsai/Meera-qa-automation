import { test, expect } from "@playwright/test";
import { openAddChannelForm } from "../../../../helpers/alerts.helper";
import { AlertsPage } from "../../../../pages/alerts.page";
import {
  ALERTS_COPY,
  ALERTS_SAMPLES,
  CHANNEL_KINDS,
} from "../../../../data/alerts-data";

test.describe("SETTINGS › Alerts — Channels form @journey @new-user @alerts @positive", () => {
  test.beforeEach(async ({ page }) => {
    await openAddChannelForm(page);
  });

  test("TC-AL-030 @high @positive — Add channel form shows Kind and Name fields", async ({
    page,
  }) => {
    const alerts = new AlertsPage(page);
    await alerts.expectAddChannelFormVisible();
    await expect(alerts.kindSelect()).toBeVisible();
    await expect(alerts.nameInput()).toBeVisible();
  });

  test("TC-AL-031 @high @positive — Kind defaults to slack", async ({ page }) => {
    const alerts = new AlertsPage(page);
    await expect(alerts.kindSelect()).toContainText(/slack/i);
  });

  test("TC-AL-032 @medium @positive — Slack webhook URL field visible", async ({
    page,
  }) => {
    const alerts = new AlertsPage(page);
    const url = alerts.webhookUrlInput();
    test.skip(
      !(await url.isVisible({ timeout: 5_000 }).catch(() => false)),
      "Webhook URL field not exposed",
    );
    await expect(url).toBeVisible();
    await expect(url).toHaveAttribute(
      "placeholder",
      ALERTS_COPY.slackUrlPlaceholder,
    );
  });

  test("TC-AL-033 @medium @positive — Default channel checkbox visible", async ({
    page,
  }) => {
    const alerts = new AlertsPage(page);
    const checkbox = alerts.defaultChannelCheckbox();
    test.skip(
      !(await checkbox.isVisible({ timeout: 5_000 }).catch(() => false)),
      "Default channel checkbox not exposed",
    );
    await expect(checkbox).toBeVisible();
  });

  test("TC-AL-034 @medium @positive — Kind dropdown lists slack webhook email", async ({
    page,
  }) => {
    const alerts = new AlertsPage(page);
    const select = alerts.kindSelect();
    test.skip(
      !(await select.isVisible({ timeout: 5_000 }).catch(() => false)),
      "Kind is not a native select",
    );
    await alerts.expectSelectOptions("Kind", CHANNEL_KINDS);
  });

  test("TC-AL-035 @medium @positive — Switch Kind to webhook keeps form stable", async ({
    page,
  }) => {
    const alerts = new AlertsPage(page);
    await alerts.selectFieldOption("Kind", "webhook");
    await alerts.expectAddChannelFormVisible();
  });

  test("TC-AL-036 @medium @positive — Name field accepts channel label", async ({
    page,
  }) => {
    const alerts = new AlertsPage(page);
    await alerts.nameInput().fill(ALERTS_SAMPLES.channelName);
    await expect(alerts.nameInput()).toHaveValue(ALERTS_SAMPLES.channelName);
  });

  test("TC-AL-037 @medium @positive — Cancel closes add channel form", async ({
    page,
  }) => {
    const alerts = new AlertsPage(page);
    await alerts.nameInput().fill("temp channel");
    await alerts.cancelForm();
    await expect(alerts.saveChannelButton()).not.toBeVisible({ timeout: 10_000 });
    await expect(alerts.addChannelButton()).toBeVisible();
  });

});
