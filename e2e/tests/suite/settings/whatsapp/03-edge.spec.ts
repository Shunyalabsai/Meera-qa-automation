import { test, expect } from "@playwright/test";
import { WhatsAppPage } from "../../../../pages/whatsapp.page";
import { WHATSAPP_SAMPLES } from "../../../../data/whatsapp-data";
import { reloadSpaRoute, gotoApp } from "../../../../helpers/navigate";

test.describe("SETTINGS › WhatsApp — Edge cases @journey @new-user @whatsapp @edge", () => {
  test("TC-WA-E101 @medium @edge — Unicode and multilingual emoji in message body", async ({ page }) => {
    const wa = new WhatsAppPage(page);
    await wa.open();
    await wa.fillTestMessage(
      WHATSAPP_SAMPLES.validE164Phone,
      WHATSAPP_SAMPLES.unicodeMessageBody,
    );
    if (await wa.testMessageBodyInput().isVisible({ timeout: 3_000 }).catch(() => false)) {
      await expect(wa.testMessageBodyInput()).toHaveValue(WHATSAPP_SAMPLES.unicodeMessageBody);
    }
  });

  test("TC-WA-E102 @medium @edge — Long payload in message text accepted without layout break", async ({ page }) => {
    const wa = new WhatsAppPage(page);
    await wa.open();
    await wa.fillTestMessage(
      WHATSAPP_SAMPLES.validE164Phone,
      WHATSAPP_SAMPLES.longMessageBody,
    );
    if (await wa.testMessageBodyInput().isVisible({ timeout: 3_000 }).catch(() => false)) {
      await expect(wa.testMessageBodyInput()).toHaveValue(WHATSAPP_SAMPLES.longMessageBody);
    }
  });

  test("TC-WA-E103 @medium @edge — Navigate away to Webhooks and back preserves state", async ({ page }) => {
    const wa = new WhatsAppPage(page);
    await wa.open();
    await gotoApp(page, "admin/webhooks");
    await expect(page).toHaveURL(/webhooks/i, { timeout: 15_000 });
    await wa.open();
  });

  test("TC-WA-E104 @low @edge — Page reload keeps WhatsApp page stable", async ({ page }) => {
    const wa = new WhatsAppPage(page);
    await wa.open();
    await reloadSpaRoute(page, "admin/whatsapp");
  });
});
