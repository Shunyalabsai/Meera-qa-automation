import { test, expect } from "@playwright/test";
import {
  openAlerts,
  openNewRuleForm,
  openAddChannelForm,
} from "../../../../../helpers/alerts.helper";

test.describe("SETTINGS › Alerts — CTA functional @journey @existing-user @alerts @cta", () => {
  test("CTA-AL-010 @high @cta — New rule opens create form", async ({ page }) => {
    const alerts = await openAlerts(page);
    await alerts.clickNewRule();
    await expect(alerts.createRuleButton()).toBeVisible();
  });

  test("CTA-AL-011 @high @cta — Add channel opens save form", async ({ page }) => {
    const alerts = await openAlerts(page);
    await alerts.channelsTab().click();
    await alerts.clickAddChannel();
    await expect(alerts.saveChannelButton()).toBeVisible();
  });

  test("CTA-AL-012 @medium @cta — Rules tab shows rules section", async ({
    page,
  }) => {
    const alerts = await openAlerts(page);
    await alerts.channelsTab().click();
    await alerts.rulesTab().click();
    await expect(page.getByText(/Rules/i).first()).toBeVisible();
  });

  test("CTA-AL-013 @medium @cta — Channels tab shows channels section", async ({
    page,
  }) => {
    const alerts = await openAlerts(page);
    await alerts.channelsTab().click();
    await expect(page.getByText(/Channels/i).first()).toBeVisible();
  });

  test("CTA-AL-014 @medium @cta — Cancel on rule form returns to list view", async ({
    page,
  }) => {
    const alerts = await openNewRuleForm(page);
    await alerts.cancelForm();
    await expect(alerts.newRuleButton()).toBeVisible();
  });

  test("CTA-AL-015 @medium @cta — Cancel on channel form returns to list view", async ({
    page,
  }) => {
    const alerts = await openAddChannelForm(page);
    await alerts.cancelForm();
    await expect(alerts.addChannelButton()).toBeVisible();
  });
});
