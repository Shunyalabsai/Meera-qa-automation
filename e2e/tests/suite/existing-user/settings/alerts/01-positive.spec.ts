import { test, expect } from "@playwright/test";
import { openAlerts } from "../../../../../helpers/alerts.helper";
import { skipUnlessHasAlertRules } from "../../../../../helpers/existing-user.helper";

test.describe("SETTINGS › Alerts — Positive @journey @existing-user @alerts @positive", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await skipUnlessHasAlertRules(page, testInfo);
  });

  test("TC-AL-EU-010 @medium @positive — Channels tab reachable", async ({
    page,
  }) => {
    const alerts = await openAlerts(page);
    await alerts.channelsTab().click();
    await expect(alerts.addChannelButton()).toBeVisible();
  });
});
