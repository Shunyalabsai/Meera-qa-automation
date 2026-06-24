import { test } from "@playwright/test";
import { PhoneNumbersPage } from "../../../../pages/phone-numbers.page";

test.describe("RUN › Phone numbers @smoke", () => {
  test("Phone numbers page loads with Add number action", async ({ page }) => {
    const phoneNumbers = new PhoneNumbersPage(page);
    await phoneNumbers.open();
  });
});
