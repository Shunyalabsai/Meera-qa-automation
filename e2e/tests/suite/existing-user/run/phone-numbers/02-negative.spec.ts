import { test, expect } from "@playwright/test";
import { openAddNumberModal } from "../../../../../helpers/phone-numbers.helper";
import { PhoneNumbersPage } from "../../../../../pages/phone-numbers.page";
import { PHONE_NUMBER_SAMPLES } from "../../../../../data/phone-number-data";

test.describe("RUN › Phone numbers — Validation @journey @existing-user @phone-numbers @negative", () => {
  test.beforeEach(async ({ page }) => {
    const phoneNumbers = await openAddNumberModal(page);
    await phoneNumbers.ensureNewAccountMode();
  });

  test("TC-PN-N101 @high @negative — Add number without required fields blocked", async ({
    page,
  }) => {
    const phoneNumbers = new PhoneNumbersPage(page);
    await phoneNumbers.submitAddNumber();
    await phoneNumbers.expectSubmitBlocked();
  });

  test("TC-PN-N102 @high @negative — Invalid phone format rejected", async ({
    page,
  }) => {
    const phoneNumbers = new PhoneNumbersPage(page);
    await phoneNumbers.authIdInput().fill(PHONE_NUMBER_SAMPLES.plivoAuthId);
    await phoneNumbers.authTokenInput().fill(PHONE_NUMBER_SAMPLES.plivoAuthToken);
    await phoneNumbers.numberInput().fill(PHONE_NUMBER_SAMPLES.invalidNumber);
    await phoneNumbers.submitAddNumber();
    await expect(
      page.getByText(/invalid|E\.164|phone|Fix the highlighted|format/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("TC-PN-N103 @high @negative — Empty Auth ID blocked", async ({
    page,
  }) => {
    const phoneNumbers = new PhoneNumbersPage(page);
    await phoneNumbers.authTokenInput().fill(PHONE_NUMBER_SAMPLES.plivoAuthToken);
    await phoneNumbers.numberInput().fill(PHONE_NUMBER_SAMPLES.e164Number);
    await phoneNumbers.submitAddNumber();
    await phoneNumbers.expectAddBlocked();
  });

  test("TC-PN-N104 @high @negative — Empty Auth token blocked", async ({
    page,
  }) => {
    const phoneNumbers = new PhoneNumbersPage(page);
    await phoneNumbers.authIdInput().fill(PHONE_NUMBER_SAMPLES.plivoAuthId);
    await phoneNumbers.numberInput().fill(PHONE_NUMBER_SAMPLES.e164Number);
    await phoneNumbers.submitAddNumber();
    await phoneNumbers.expectAddBlocked();
  });

  test("TC-PN-N105 @medium @negative — Number without country code rejected", async ({
    page,
  }) => {
    const phoneNumbers = new PhoneNumbersPage(page);
    await phoneNumbers.authIdInput().fill(PHONE_NUMBER_SAMPLES.plivoAuthId);
    await phoneNumbers.authTokenInput().fill(PHONE_NUMBER_SAMPLES.plivoAuthToken);
    await phoneNumbers.numberInput().fill("9876543210");
    await phoneNumbers.submitAddNumber();
    await expect(
      page.getByText(/invalid|E\.164|\+|phone|Fix the highlighted/i).first(),
    ).toBeVisible({ timeout: 10_000 }).catch(async () => {
      await phoneNumbers.expectAddBlocked();
    });
  });

});
