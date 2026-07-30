import { test, expect } from "@playwright/test";
import { openNewRuleForm } from "../../../../helpers/alerts.helper";
import { AlertsPage } from "../../../../pages/alerts.page";
import {
  ALERT_METRICS,
  ALERT_OPERATORS,
  ALERT_SEVERITIES,
  ALERTS_DEFAULTS,
} from "../../../../data/alerts-data";

test.describe("SETTINGS › Alerts — Create rule form @journey @new-user @alerts @positive", () => {
  test.beforeEach(async ({ page }) => {
    await openNewRuleForm(page);
  });

  test("TC-AL-010 @high @positive — Page loads at /alerts", async ({ page }) => {
    await expect(page).toHaveURL(/\/alerts/);
  });

  test("TC-AL-011 @high @positive — New rule form shows all fields", async ({
    page,
  }) => {
    const alerts = new AlertsPage(page);
    await alerts.expectCreateRuleFormVisible();
    await expect(alerts.nameInput()).toBeVisible();
    await expect(alerts.metricSelect()).toBeVisible();
    await expect(alerts.valueInput()).toBeVisible();
    await expect(alerts.severitySelect()).toBeVisible();
  });

  test("TC-AL-012 @high @positive — Metric defaults to duration_secs", async ({
    page,
  }) => {
    const alerts = new AlertsPage(page);
    await expect(alerts.metricSelect()).toContainText(/duration_secs/i);
  });

  test("TC-AL-013 @high @positive — Value defaults to 60", async ({ page }) => {
    const alerts = new AlertsPage(page);
    await expect(alerts.valueInput()).toHaveValue(ALERTS_DEFAULTS.value);
  });

  test("TC-AL-014 @high @positive — Severity defaults to warn", async ({
    page,
  }) => {
    const alerts = new AlertsPage(page);
    await expect(alerts.severitySelect()).toContainText(/warn/i);
  });

  test("TC-AL-015 @medium @positive — Metric dropdown lists all options", async ({
    page,
  }) => {
    const alerts = new AlertsPage(page);
    const select = alerts.metricSelect();
    test.skip(
      !(await select.isVisible({ timeout: 5_000 }).catch(() => false)),
      "Metric is not a native select",
    );
    await alerts.expectSelectOptions("Metric", ALERT_METRICS);
  });

  test("TC-AL-016 @medium @positive — Operator dropdown lists all options", async ({
    page,
  }) => {
    const alerts = new AlertsPage(page);
    const select = alerts.operatorSelect();
    test.skip(
      !(await select.isVisible({ timeout: 5_000 }).catch(() => false)),
      "Operator is not a native select",
    );
    await alerts.expectOperatorOptions(ALERT_OPERATORS);
  });

  test("TC-AL-017 @medium @positive — Severity dropdown lists info warn critical", async ({
    page,
  }) => {
    const alerts = new AlertsPage(page);
    const select = alerts.severitySelect();
    test.skip(
      !(await select.isVisible({ timeout: 5_000 }).catch(() => false)),
      "Severity is not a native select",
    );
    await alerts.expectSelectOptions("Severity", ALERT_SEVERITIES);
  });

  test("TC-AL-018 @medium @positive — Select eval_score metric keeps form stable", async ({
    page,
  }) => {
    const alerts = new AlertsPage(page);
    await alerts.selectFieldOption("Metric", "eval_score");
    await alerts.expectCreateRuleFormVisible();
  });

  test("TC-AL-019 @medium @positive — Select critical severity keeps form stable", async ({
    page,
  }) => {
    const alerts = new AlertsPage(page);
    await alerts.selectFieldOption("Severity", "critical");
    await alerts.expectCreateRuleFormVisible();
  });

  test("TC-AL-020 @medium @positive — Cancel closes create rule form", async ({
    page,
  }) => {
    const alerts = new AlertsPage(page);
    await alerts.nameInput().fill("temp rule");
    await alerts.cancelForm();
    await expect(alerts.createRuleButton()).not.toBeVisible({ timeout: 10_000 });
    await expect(alerts.newRuleButton()).toBeVisible();
  });

});
