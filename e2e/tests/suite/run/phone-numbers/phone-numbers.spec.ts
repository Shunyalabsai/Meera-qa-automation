import { test } from "@playwright/test";
import { PhoneNumbersPage } from "../../../../pages/phone-numbers.page";

test.describe("RUN › Phone numbers", () => {
  test("TC-PN-001 @smoke @high @positive — Phone numbers page loads with Add number action", async ({ page }) => {
    const phoneNumbers = new PhoneNumbersPage(page);
    await phoneNumbers.open();
  });
});
