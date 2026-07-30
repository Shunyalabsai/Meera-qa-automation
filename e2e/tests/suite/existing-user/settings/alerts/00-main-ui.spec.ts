import { test, expect } from "@playwright/test";
import { openAlerts } from "../../../../../helpers/alerts.helper";
import { skipUnlessHasAlertRules } from "../../../../../helpers/existing-user.helper";

test.describe("SETTINGS › Alerts — Populated rules @journey @existing-user @alerts @ui", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await skipUnlessHasAlertRules(page, testInfo);
  });

  test("TC-AL-EU-001 @high @ui — Rules tab shows configured rules", async ({
    page,
  }) => {
    const alerts = await openAlerts(page);
    await alerts.expectTabsVisible();
    await expect(alerts.newRuleButton()).toBeVisible();
  });
});
