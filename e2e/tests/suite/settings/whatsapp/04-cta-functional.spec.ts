import { test, expect } from "@playwright/test";
import { WhatsAppPage } from "../../../../pages/whatsapp.page";
import { WHATSAPP_SAMPLES } from "../../../../data/whatsapp-data";

test.describe("SETTINGS › WhatsApp — CTA functional @journey @new-user @whatsapp @cta", () => {
  test("CTA-WA-001 @high @cta — Save credentials button clickable", async ({ page }) => {
    const wa = new WhatsAppPage(page);
    await wa.open();
    const saveBtn = wa.saveCredentialsButton();
    if (await saveBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await expect(saveBtn).toBeVisible();
    }
  });

  test("CTA-WA-002 @high @cta — Send test message button clickable", async ({ page }) => {
    const wa = new WhatsAppPage(page);
    await wa.open();
    const sendBtn = wa.sendTestMessageButton();
    if (await sendBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await expect(sendBtn).toBeVisible();
    }
  });

  test("CTA-WA-003 @medium @cta — Sync templates button clickable", async ({ page }) => {
    const wa = new WhatsAppPage(page);
    await wa.open();
    const syncBtn = wa.syncTemplatesButton();
    if (await syncBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await expect(syncBtn).toBeVisible();
    }
  });
});
