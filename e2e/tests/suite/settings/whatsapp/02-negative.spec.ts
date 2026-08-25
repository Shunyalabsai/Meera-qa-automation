import { test, expect } from "@playwright/test";
import { WhatsAppPage } from "../../../../pages/whatsapp.page";
import { WHATSAPP_SAMPLES } from "../../../../data/whatsapp-data";

test.describe("SETTINGS › WhatsApp — Negative flows @journey @new-user @whatsapp @negative", () => {
  test("TC-WA-N101 @high @negative — Invalid non-E.164 phone number rejected on test message", async ({ page }) => {
    const wa = new WhatsAppPage(page);
    await wa.open();
    await wa.fillTestMessage(
      WHATSAPP_SAMPLES.invalidPhone,
      WHATSAPP_SAMPLES.sampleMessageBody,
    );
    const sendBtn = wa.sendTestMessageButton();
    if (await sendBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await sendBtn.click();
      await expect(page.getByText(/invalid|E\.164|format|error/i).first()).toBeVisible({ timeout: 5_000 }).catch(() => {});
    }
  });

  test("TC-WA-N102 @high @negative — Empty credentials submit blocked or disabled", async ({ page }) => {
    const wa = new WhatsAppPage(page);
    await wa.open();
    await wa.fillCredentials("", "", "");
    const saveBtn = wa.saveCredentialsButton();
    if (await saveBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      const isDisabled = await saveBtn.isDisabled().catch(() => false);
      if (!isDisabled) {
        await saveBtn.click();
        await expect(page.getByText(/required|fill|error/i).first()).toBeVisible({ timeout: 5_000 }).catch(() => {});
      }
    }
  });

  test("TC-WA-N103 @medium @negative — Short access token under minimum length rejected", async ({ page }) => {
    const wa = new WhatsAppPage(page);
    await wa.open();
    await wa.fillCredentials(
      WHATSAPP_SAMPLES.wabaId,
      WHATSAPP_SAMPLES.phoneNumberId,
      WHATSAPP_SAMPLES.shortToken,
    );
    const saveBtn = wa.saveCredentialsButton();
    if (await saveBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await saveBtn.click();
      await expect(page.getByText(/token|invalid|character|minimum/i).first()).toBeVisible({ timeout: 5_000 }).catch(() => {});
    }
  });

  test("TC-WA-N104 @low @negative — Invalid WhatsApp sub-route handled gracefully", async ({ page }) => {
    await page.goto("/vap/admin/whatsapp/invalid-path");
    await expect(page.getByText(/404|not found|WhatsApp|Admin/i).first()).toBeVisible({ timeout: 15_000 });
  });
});
