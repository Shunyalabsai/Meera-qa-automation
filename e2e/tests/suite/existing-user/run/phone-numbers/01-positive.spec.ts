import { test, expect } from "@playwright/test";
import { PhoneNumbersPage } from "../../../../../pages/phone-numbers.page";
import { skipUnlessHasPhoneNumbers } from "../../../../../helpers/existing-user.helper";

test.describe("RUN › Phone numbers — Positive @journey @existing-user @phone-numbers @positive", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await skipUnlessHasPhoneNumbers(page, testInfo);
  });

  test("TC-PN-EU-010 @medium @positive — Add number button still visible", async ({
    page,
  }) => {
    const phoneNumbers = new PhoneNumbersPage(page);
    await phoneNumbers.open();
    await expect(phoneNumbers.addNumberButton()).toBeVisible();
  });
});
