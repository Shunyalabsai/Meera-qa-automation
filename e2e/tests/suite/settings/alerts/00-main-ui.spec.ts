import { test, expect } from "@playwright/test";
import { AlertsPage } from "../../../../pages/alerts.page";
import { isAlertsRulesEmpty } from "../../../../helpers/alerts.helper";
import { ALERTS_COPY } from "../../../../data/alerts-data";

test.describe("SETTINGS › Alerts — Main UI @journey @new-user @alerts", () => {
  test("TC-AL-002 @high @ui — Rules tab empty state shows No alert rules yet", async ({
    page,
  }) => {
    test.skip(
      !(await isAlertsRulesEmpty(page)),
      "Alert rules exist — empty state not shown",
    );
    const alerts = new AlertsPage(page);
    await alerts.expectRulesEmptyState();
  });

  test("TC-AL-003 @high @ui — Recent events empty state", async ({ page }) => {
    test.skip(
      !(await isAlertsRulesEmpty(page)),
      "Alert rules exist — empty state not shown",
    );
    const alerts = new AlertsPage(page);
    await alerts.open();
    await alerts.rulesTab().click();
    await expect(page.getByText(ALERTS_COPY.eventsEmpty)).toBeVisible();
  });

  test("TC-AL-004 @high @ui — Header subtitle and New rule button visible", async ({
    page,
  }) => {
    const alerts = new AlertsPage(page);
    await alerts.open();
    await expect(page.getByText(ALERTS_COPY.subtitle).first()).toBeVisible();
    await expect(alerts.newRuleButton()).toBeVisible();
    await expect(alerts.newRuleButton()).toBeEnabled();
  });

  test("TC-AL-005 @medium @ui — Rules and Channels tabs visible", async ({
    page,
  }) => {
    const alerts = new AlertsPage(page);
    await alerts.open();
    await alerts.expectTabsVisible();
  });

  test("TC-AL-006 @medium @ui — Channels tab empty state", async ({ page }) => {
    test.skip(
      !(await isAlertsRulesEmpty(page)),
      "Alert rules exist — empty state not shown",
    );
    const alerts = new AlertsPage(page);
    await alerts.open();
    await alerts.expectChannelsEmptyState();
  });

  test("TC-AL-007 @medium @ui — Sidebar Alerts nav link visible", async ({
    page,
  }) => {
    const alerts = new AlertsPage(page);
    await alerts.open();
    await expect(page.getByRole("link", { name: /^Alerts$/i })).toBeVisible();
  });
});
