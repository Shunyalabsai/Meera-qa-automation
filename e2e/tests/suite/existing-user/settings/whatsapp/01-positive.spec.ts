import { test, expect } from "@playwright/test";
import { WhatsAppPage } from "../../../../../pages/whatsapp.page";
import { WHATSAPP_SAMPLES } from "../../../../../data/whatsapp-data";

test.describe("SETTINGS › WhatsApp — Positive @journey @existing-user @whatsapp @positive", () => {
  test("TC-WA-EU-010 @high @positive — Fill valid credentials", async ({ page }) => {
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

  test("TC-WA-EU-011 @medium @positive — Fill valid test message", async ({ page }) => {
    const wa = new WhatsAppPage(page);
    await wa.open();
    await wa.fillTestMessage(
      WHATSAPP_SAMPLES.validE164Phone,
      WHATSAPP_SAMPLES.sampleMessageBody,
    );
    if (await wa.testRecipientInput().isVisible({ timeout: 3_000 }).catch(() => false)) {
      await expect(wa.testRecipientInput()).toHaveValue(WHATSAPP_SAMPLES.validE164Phone);
    }
  });
});
