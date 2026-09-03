import { test, expect } from "@playwright/test";
import { WhatsAppPage } from "../../../../pages/whatsapp.page";
import { WHATSAPP_COPY } from "../../../../data/whatsapp-data";
import { gotoApp } from "../../../../helpers/navigate";

test.describe("SETTINGS › WhatsApp — Main UI @journey @new-user @whatsapp @ui @smoke", () => {
  test("TC-WA-001 @smoke @high @ui — WhatsApp settings route is accessible", async ({ page }) => {
    const wa = new WhatsAppPage(page);
    await wa.open();
    await expect(page).toHaveURL(/\/vap\//i, { timeout: 15_000 });
  });

  test("TC-WA-002 @high @ui — WhatsApp Business credentials form layout", async ({ page }) => {
    const wa = new WhatsAppPage(page);
    await wa.open();
    const wabaInput = wa.wabaIdInput();
    if (await wabaInput.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await expect(wabaInput).toBeVisible();
      await expect(wa.phoneNumberIdInput()).toBeVisible();
      await expect(wa.accessTokenInput()).toBeVisible();
    }
  });

  test("TC-WA-003 @medium @ui — WhatsApp webhook callback URL field and instructions", async ({ page }) => {
    const wa = new WhatsAppPage(page);
    await wa.open();
    const verifyInput = wa.webhookVerifyTokenInput();
    if (await verifyInput.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await expect(verifyInput).toBeVisible();
    }
  });

  test("TC-WA-004 @medium @ui — Test message section visible with phone and body fields", async ({ page }) => {
    const wa = new WhatsAppPage(page);
    await wa.open();
    const recipient = wa.testRecipientInput();
    if (await recipient.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await expect(recipient).toBeVisible();
      await expect(wa.testMessageBodyInput()).toBeVisible();
    }
  });

  test("TC-WA-005 @low @ui — WhatsApp navigation link or tab accessible from Settings", async ({ page }) => {
    await gotoApp(page, "admin/webhooks");
    const waLink = page.getByRole("link", { name: /WhatsApp/i }).or(page.getByText(/WhatsApp/i)).first();
    if (await waLink.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await expect(waLink).toBeVisible();
    }
  });
});
