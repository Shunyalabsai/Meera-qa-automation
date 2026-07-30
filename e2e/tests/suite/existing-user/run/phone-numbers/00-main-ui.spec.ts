import { test, expect } from "@playwright/test";
import { PhoneNumbersPage } from "../../../../../pages/phone-numbers.page";
import { skipUnlessHasPhoneNumbers } from "../../../../../helpers/existing-user.helper";

test.describe("RUN › Phone numbers — Populated @journey @existing-user @phone-numbers @ui", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await skipUnlessHasPhoneNumbers(page, testInfo);
  });

  test("TC-PN-EU-001 @high @ui — Phone numbers list not empty", async ({
    page,
  }) => {
    const phoneNumbers = new PhoneNumbersPage(page);
    await phoneNumbers.open();
    await expect(
      page.getByText(/No phone numbers registered yet/i),
    ).not.toBeVisible();
  });
});
