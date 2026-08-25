import { test, expect } from "@playwright/test";
import { openAddNumberModal, openPhoneNumbers } from "../../../../helpers/phone-numbers.helper";
import { skipEnvPrecondition } from "../../../../helpers/skip";

test.describe("RUN › Phone numbers — CTA functional @phone-numbers @cta", () => {
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

  test("CTA-PN-003 @medium @cta — Set up a new account reveals Plivo credential fields", async ({
    page,
  }) => {
    const phoneNumbers = await openAddNumberModal(page);
    await phoneNumbers.ensureNewAccountMode();
    await expect(phoneNumbers.setupNewAccountRadio()).toBeChecked();
    await expect(phoneNumbers.authIdInput()).toBeVisible();
    await expect(phoneNumbers.authTokenInput()).toBeVisible();
  });

  test("CTA-PN-004 @medium @cta — Switch to existing account hides new-account fields", async ({
    page,
  }, testInfo) => {
    const phoneNumbers = await openAddNumberModal(page);
    if (!(await phoneNumbers.canUseExistingAccount())) {
      skipEnvPrecondition(
        testInfo,
        "No telephony accounts — existing account option disabled",
      );
    }
    await phoneNumbers.ensureNewAccountMode();
    await phoneNumbers.switchToExistingAccount();
    await expect(phoneNumbers.useExistingAccountRadio()).toBeChecked();
    await expect(phoneNumbers.authIdInput()).not.toBeVisible();
  });
});
