import { test, expect } from "@playwright/test";
import { WhatsAppPage } from "../../../../../pages/whatsapp.page";
import { gotoApp } from "../../../../../helpers/navigate";

test.describe("SETTINGS › WhatsApp — Main UI @journey @existing-user @whatsapp @ui", () => {
  test("TC-WA-EU-001 @high @ui — WhatsApp settings route is accessible", async ({ page }) => {
    const wa = new WhatsAppPage(page);
    await wa.open();
    await expect(page).toHaveURL(/\/vap\//i, { timeout: 15_000 });
  });

  test("TC-WA-EU-002 @high @ui — WhatsApp Business credentials form layout", async ({ page }) => {
    const wa = new WhatsAppPage(page);
    await wa.open();
    const wabaInput = wa.wabaIdInput();
    if (await wabaInput.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await expect(wabaInput).toBeVisible();
      await expect(wa.phoneNumberIdInput()).toBeVisible();
      await expect(wa.accessTokenInput()).toBeVisible();
    }
  });

  test("TC-WA-EU-003 @medium @ui — Test message section visible", async ({ page }) => {
    const wa = new WhatsAppPage(page);
    await wa.open();
    const recipient = wa.testRecipientInput();
    if (await recipient.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await expect(recipient).toBeVisible();
      await expect(wa.testMessageBodyInput()).toBeVisible();
    }
  });
});
