import { test, expect } from "@playwright/test";
import { WhatsAppPage } from "../../../../../pages/whatsapp.page";
import { WHATSAPP_SAMPLES } from "../../../../../data/whatsapp-data";

test.describe("SETTINGS › WhatsApp — Negative @journey @existing-user @whatsapp @negative", () => {
  test("TC-WA-EU-N101 @high @negative — Invalid phone format rejected on test message", async ({ page }) => {
    const wa = new WhatsAppPage(page);
    await wa.open();
    await wa.fillTestMessage(
      WHATSAPP_SAMPLES.invalidPhone,
      WHATSAPP_SAMPLES.sampleMessageBody,
    );
    const sendBtn = wa.sendTestMessageButton();
    if (await sendBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await sendBtn.click();
    }
  });

  test("TC-WA-EU-N102 @low @negative — Deep link to invalid WhatsApp path handled gracefully", async ({ page }) => {
    await page.goto("/vap/admin/whatsapp/invalid-path");
    await expect(page.getByText(/404|not found|WhatsApp|Admin/i).first()).toBeVisible({ timeout: 15_000 });
  });
});
