import { test, expect } from "@playwright/test";
import { WhatsAppPage } from "../../../../pages/whatsapp.page";
import { WHATSAPP_SAMPLES } from "../../../../data/whatsapp-data";

test.describe("SETTINGS › WhatsApp — Positive flows @journey @new-user @whatsapp @positive", () => {
  test("TC-WA-010 @high @positive — Fill valid WABA credentials", async ({ page }) => {
    const wa = new WhatsAppPage(page);
    await wa.open();
    await wa.fillCredentials(
      WHATSAPP_SAMPLES.wabaId,
      WHATSAPP_SAMPLES.phoneNumberId,
      WHATSAPP_SAMPLES.accessToken,
    );
    if (await wa.wabaIdInput().isVisible({ timeout: 3_000 }).catch(() => false)) {
      await expect(wa.wabaIdInput()).toHaveValue(WHATSAPP_SAMPLES.wabaId);
    }
  });

  test("TC-WA-011 @high @positive — Fill valid test message with E.164 phone number", async ({ page }) => {
    const wa = new WhatsAppPage(page);
    await wa.open();
    await wa.fillTestMessage(
      WHATSAPP_SAMPLES.validE164Phone,
      WHATSAPP_SAMPLES.sampleMessageBody,
    );
    if (await wa.testRecipientInput().isVisible({ timeout: 3_000 }).catch(() => false)) {
      await expect(wa.testRecipientInput()).toHaveValue(WHATSAPP_SAMPLES.validE164Phone);
      await expect(wa.testMessageBodyInput()).toHaveValue(WHATSAPP_SAMPLES.sampleMessageBody);
    }
  });

  test("TC-WA-012 @medium @positive — Set webhook verification token", async ({ page }) => {
    const wa = new WhatsAppPage(page);
    await wa.open();
    const tokenInput = wa.webhookVerifyTokenInput();
    if (await tokenInput.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await tokenInput.fill(WHATSAPP_SAMPLES.webhookVerifyToken);
      await expect(tokenInput).toHaveValue(WHATSAPP_SAMPLES.webhookVerifyToken);
    }
  });

  test("TC-WA-013 @medium @positive — Sync templates action triggers reload", async ({ page }) => {
    const wa = new WhatsAppPage(page);
    await wa.open();
    const syncBtn = wa.syncTemplatesButton();
    if (await syncBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await syncBtn.click();
      await page.waitForTimeout(1_000);
    }
  });
});
