import { test, expect } from "@playwright/test";
import { AlertsPage } from "../../../../pages/alerts.page";

test.describe("SETTINGS › Alerts @smoke @alerts", () => {
  test("TC-AL-001 @high @positive — Alerts page loads", async ({ page }) => {
    const alerts = new AlertsPage(page);
    await alerts.open();
    await alerts.expectTabsVisible();
    await expect(alerts.newRuleButton()).toBeVisible();
  });
});
