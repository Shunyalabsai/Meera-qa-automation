import { test, expect } from "@playwright/test";
import { PhoneNumbersPage } from "../../../../pages/phone-numbers.page";
import { isPhoneNumbersEmptyState } from "../../../../helpers/phone-numbers.helper";

test.describe("RUN › Phone numbers — List empty state @journey @new-user @phone-numbers", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(
      !(await isPhoneNumbersEmptyState(page)),
      "Phone numbers already registered — empty state not shown",
    );
  });

  test("TC-PN-001 @high @ui — Empty state shows No phone numbers registered yet", async ({
    page,
  }) => {
    const phoneNumbers = new PhoneNumbersPage(page);
    await phoneNumbers.expectEmptyState();
  });

  test("TC-PN-002 @high @ui — Header and Plivo/Twilio description", async ({
    page,
  }) => {
    const phoneNumbers = new PhoneNumbersPage(page);
    await phoneNumbers.expectPageHeader();
    await expect(
      page.getByText(/Credentials are encrypted at rest|only used at call time/i).first(),
    ).toBeVisible();
  });

  test("TC-PN-003 @high @positive — Add number button visible and enabled", async ({
    page,
  }) => {
    const phoneNumbers = new PhoneNumbersPage(page);
    await expect(phoneNumbers.addNumberButton()).toBeVisible();
    await expect(phoneNumbers.addNumberButton()).toBeEnabled();
  });

  test("TC-PN-004 @medium @ui — Telephony accounts (0) with no accounts message", async ({
    page,
  }) => {
    const phoneNumbers = new PhoneNumbersPage(page);
    await phoneNumbers.expectTelephonyAccountsEmpty();
  });

  test("TC-PN-005 @medium @ui — Sidebar Phone numbers nav link visible", async ({
    page,
  }) => {
    const phoneNumbers = new PhoneNumbersPage(page);
    await phoneNumbers.open();
    await expect(
      page.getByRole("link", { name: /^Phone numbers$/i }),
    ).toBeVisible();
  });
});
