import { test, expect } from "@playwright/test";
import { openAddNumberModal, openPhoneNumbers } from "../../../../../helpers/phone-numbers.helper";

test.describe("RUN › Phone numbers — CTA functional @journey @existing-user @phone-numbers @cta", () => {
  test("CTA-PN-001 @high @cta — Add number opens modal", async ({ page }) => {
    const phoneNumbers = await openPhoneNumbers(page);
    await phoneNumbers.clickAddNumber();
    await phoneNumbers.expectAddNumberModal();
  });

  test("CTA-PN-002 @medium @cta — Cancel closes modal", async ({ page }) => {
    const phoneNumbers = await openAddNumberModal(page);
    await phoneNumbers.cancelAddNumber();
    await expect(phoneNumbers.addNumberButton()).toBeVisible();
  });

  test("CTA-PN-003 @medium @cta — Plivo provider radio selectable", async ({
    page,
  }) => {
    const phoneNumbers = await openAddNumberModal(page);
    await phoneNumbers.plivoProviderRadio().click();
    await expect(phoneNumbers.plivoProviderRadio()).toBeChecked();
  });

  test("CTA-PN-004 @medium @cta — Twilio provider radio selectable", async ({
    page,
  }) => {
    const phoneNumbers = await openAddNumberModal(page);
    await phoneNumbers.switchToTwilio();
    await expect(phoneNumbers.twilioProviderRadio()).toBeChecked();
  });
});
