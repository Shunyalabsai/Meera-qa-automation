import { test, expect } from "@playwright/test";
import { openAddNumberModal, openPhoneNumbers } from "../../../../helpers/phone-numbers.helper";
import { PhoneNumbersPage } from "../../../../pages/phone-numbers.page";
import { skipEnvPrecondition } from "../../../../helpers/skip";
import { PHONE_NUMBER_SAMPLES } from "../../../../data/phone-number-data";

test.describe("RUN › Phone numbers — Edge @journey @new-user @phone-numbers @edge", () => {
  test("TC-PN-E101 @medium @edge — Toggling new/existing account mode preserves number field", async ({
    page,
  }, testInfo) => {
    await openAddNumberModal(page);
    const phoneNumbers = new PhoneNumbersPage(page);

    if (!(await phoneNumbers.canUseExistingAccount())) {
      skipEnvPrecondition(
        testInfo,
        "No telephony accounts — existing account option disabled",
      );
    }

    await phoneNumbers.numberInput().fill(PHONE_NUMBER_SAMPLES.e164Number);
    await phoneNumbers.ensureNewAccountMode();
    await phoneNumbers.switchToExistingAccount();
    await expect(phoneNumbers.numberInput()).toHaveValue(
      PHONE_NUMBER_SAMPLES.e164Number,
    );
  });

  test("TC-PN-E102 @medium @edge — Switch existing account hides Plivo credential fields", async ({
    page,
  }, testInfo) => {
    await openAddNumberModal(page);
    const phoneNumbers = new PhoneNumbersPage(page);
    if (!(await phoneNumbers.canUseExistingAccount())) {
      skipEnvPrecondition(
        testInfo,
        "No telephony accounts — existing account option disabled",
      );
    }
    await phoneNumbers.switchToExistingAccount();
    await expect(phoneNumbers.useExistingAccountRadio()).toBeChecked();
    await expect(phoneNumbers.authIdInput()).not.toBeVisible();
  });

  test("TC-PN-E103 @medium @edge — Re-open modal shows fresh form after cancel", async ({
    page,
  }) => {
    const phoneNumbers = await openPhoneNumbers(page);
    await phoneNumbers.clickAddNumber();
    await phoneNumbers.numberInput().fill(PHONE_NUMBER_SAMPLES.e164Number);
    await phoneNumbers.cancelAddNumber();
    await phoneNumbers.clickAddNumber();
    await expect(phoneNumbers.numberInput()).toHaveValue("");
  });

  test("TC-PN-E104 @low @edge — Very long number label accepted in field", async ({
    page,
  }) => {
    await openAddNumberModal(page);
    const phoneNumbers = new PhoneNumbersPage(page);
    const label = phoneNumbers.numberLabelInput();
    if (await label.isVisible({ timeout: 2_000 }).catch(() => false)) {
      const longLabel = "Line " + "X".repeat(100);
      await label.fill(longLabel);
      await expect(label).toHaveValue(longLabel);
    }
  });

});
