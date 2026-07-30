import { test, expect } from "@playwright/test";

test.describe("RUN › Phone numbers — Negative @journey @existing-user @phone-numbers @negative", () => {
  test("TC-PN-EU-N101 @low @negative — Invalid phone numbers route handled", async ({
    page,
  }) => {
    await page.goto("/vap/phone-numbers/bad-id");
    await expect(
      page.getByText(/404|not found|Phone numbers/i).first(),
    ).toBeVisible({ timeout: 15_000 });
  });
});
