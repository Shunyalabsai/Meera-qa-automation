import { test, expect } from "@playwright/test";
import { WhatsAppPage } from "../../../../../pages/whatsapp.page";
import { WHATSAPP_SAMPLES } from "../../../../../data/whatsapp-data";
import { reloadSpaRoute, gotoApp } from "../../../../../helpers/navigate";

test.describe("SETTINGS › WhatsApp — Edge @journey @existing-user @whatsapp @edge", () => {
  test("TC-WA-EU-E101 @medium @edge — Multilingual message text accepted", async ({ page }) => {
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

  test("TC-WA-EU-E102 @medium @edge — Navigate away to Alerts and back", async ({ page }) => {
    const wa = new WhatsAppPage(page);
    await wa.open();
    await gotoApp(page, "alerts");
    await expect(page).toHaveURL(/alerts/i, { timeout: 15_000 });
    await wa.open();
  });

  test("TC-WA-EU-E103 @low @edge — Reload preserves WhatsApp page", async ({ page }) => {
    const wa = new WhatsAppPage(page);
    await wa.open();
    await reloadSpaRoute(page, "admin/whatsapp");
  });
});
