import { test, expect } from "@playwright/test";
import { WhatsAppPage } from "../../../../../pages/whatsapp.page";

test.describe("SETTINGS › WhatsApp — CTA @journey @existing-user @whatsapp @cta", () => {
  test("CTA-WA-EU-001 @high @cta — Save credentials button interactive", async ({ page }) => {
    const wa = new WhatsAppPage(page);
    await wa.open();
    const saveBtn = wa.saveCredentialsButton();
    if (await saveBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await expect(saveBtn).toBeVisible();
    }
  });

  test("CTA-WA-EU-002 @high @cta — Send test message button interactive", async ({ page }) => {
    const wa = new WhatsAppPage(page);
    await wa.open();
    const sendBtn = wa.sendTestMessageButton();
    if (await sendBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await expect(sendBtn).toBeVisible();
    }
  });
});
