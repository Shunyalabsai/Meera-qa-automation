import { test, expect } from "@playwright/test";
import { openAddNumberModal } from "../../../../helpers/phone-numbers.helper";
import { PhoneNumbersPage } from "../../../../pages/phone-numbers.page";
import { skipEnvPrecondition } from "../../../../helpers/skip";
import { PHONE_NUMBER_SAMPLES } from "../../../../data/phone-number-data";

test.describe("RUN › Phone numbers — Add modal UI @journey @new-user @phone-numbers @positive", () => {
  test.beforeEach(async ({ page }) => {
    await openAddNumberModal(page);
  });

  test("TC-PN-010 @smoke @high @ui — Add phone number modal opens with Account and Number sections", async ({
    page,
  }) => {
    const phoneNumbers = new PhoneNumbersPage(page);
    await phoneNumbers.expectAddNumberModal();
    await expect(page.getByText(/^Account$/i).first()).toBeVisible();
    await expect(page.getByText(/^Number$/i).first()).toBeVisible();
  });

  test("TC-PN-011 @high @positive — Set up new account with Plivo selected by default", async ({
    page,
  }) => {
    const phoneNumbers = new PhoneNumbersPage(page);
    await phoneNumbers.expectNewAccountPlivoFields();
    await expect(phoneNumbers.authIdInput()).toHaveAccessibleName(/Plivo Auth ID/i);
  });

  test("TC-PN-012 @medium @positive — New-account form is Plivo-scoped", async ({
    page,
  }) => {
    const phoneNumbers = new PhoneNumbersPage(page);
    await phoneNumbers.expectNewAccountPlivoFields();
    await expect(
      page.getByText(/belongs to the Plivo account/i).first(),
    ).toBeVisible();
  });

  test("TC-PN-013 @medium @positive — Use an existing account option available", async ({
    page,
  }, testInfo) => {
    const phoneNumbers = new PhoneNumbersPage(page);
    if (!(await phoneNumbers.canUseExistingAccount())) {
      skipEnvPrecondition(
        testInfo,
        "No telephony accounts — existing account option disabled",
      );
    }
    await phoneNumbers.switchToExistingAccount();
    await expect(phoneNumbers.useExistingAccountRadio()).toBeChecked();
  });

  test("TC-PN-014 @medium @positive — Number field accepts E.164 format", async ({
    page,
  }) => {
    const phoneNumbers = new PhoneNumbersPage(page);
    await phoneNumbers.numberInput().fill(PHONE_NUMBER_SAMPLES.e164Number);
    await expect(phoneNumbers.numberInput()).toHaveValue(
      PHONE_NUMBER_SAMPLES.e164Number,
    );
  });

  test("TC-PN-015 @medium @positive — Optional account and number labels accept text", async ({
    page,
  }) => {
    const phoneNumbers = new PhoneNumbersPage(page);
    const accountLabel = phoneNumbers.accountLabelInput();
    if (await accountLabel.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await accountLabel.fill(PHONE_NUMBER_SAMPLES.accountLabel);
      await expect(accountLabel).toHaveValue(PHONE_NUMBER_SAMPLES.accountLabel);
    }
    const numberLabel = phoneNumbers.numberLabelInput();
    if (await numberLabel.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await numberLabel.fill(PHONE_NUMBER_SAMPLES.numberLabel);
      await expect(numberLabel).toHaveValue(PHONE_NUMBER_SAMPLES.numberLabel);
    }
  });

  test("TC-PN-016 @medium @positive — Cancel closes modal without adding", async ({
    page,
  }) => {
    const phoneNumbers = new PhoneNumbersPage(page);
    await phoneNumbers.numberInput().fill(PHONE_NUMBER_SAMPLES.e164Number);
    await phoneNumbers.cancelAddNumber();
    await expect(
      page.getByRole("heading", { name: /Add phone number/i }),
    ).not.toBeVisible({ timeout: 5_000 });
    await phoneNumbers.expectPageHeader();
  });
});
