import { test, expect } from "@playwright/test";
import { openAlerts, openNewRuleForm } from "../../../../helpers/alerts.helper";
import { reloadSpaRoute } from "../../../../helpers/navigate";
import { AlertsPage } from "../../../../pages/alerts.page";
import { ALERTS_SAMPLES } from "../../../../data/alerts-data";

test.describe("SETTINGS › Alerts — Edge @journey @new-user @alerts @edge", () => {
  test("TC-AL-E101 @medium @edge — Switch Rules and Channels tabs preserves page", async ({
    page,
  }) => {
    const alerts = await openAlerts(page);
    await alerts.rulesTab().click();
    await expect(page.getByText(/Rules/i).first()).toBeVisible();
    await alerts.channelsTab().click();
    await alerts.expectChannelsTabLoaded();
    await alerts.rulesTab().click();
    await alerts.expectRulesTabLoaded();
  });

  test("TC-AL-E102 @medium @edge — Navigate away and back preserves Alerts page", async ({
    page,
  }) => {
    const alerts = await openAlerts(page);
    await page.getByRole("link", { name: /^Billing$/i }).click();
    await expect(page).toHaveURL(/\/billing/, { timeout: 30_000 });
    await page.getByRole("link", { name: /^Alerts$/i }).click();
    await alerts.expectPageHeader();
    await alerts.expectTabsVisible();
  });

  test("TC-AL-E103 @medium @edge — SETTINGS siblings reachable from Alerts", async ({
    page,
  }) => {
    await openAlerts(page);
    await page.getByRole("link", { name: /^Billing$/i }).click();
    await expect(page).toHaveURL(/\/billing/, { timeout: 30_000 });
    await page.getByRole("link", { name: /^Webhooks$/i }).click();
    await expect(page).toHaveURL(/\/webhooks/, { timeout: 30_000 });
  });

  test("TC-AL-E104 @low @edge — Page reload keeps Alerts heading and tabs", async ({
    page,
  }) => {
    const alerts = await openAlerts(page);
    await alerts.expectTabsVisible();
    await reloadSpaRoute(page, "alerts");
    await alerts.expectPageHeader();
    await alerts.expectTabsVisible();
  });

  test("TC-AL-E105 @medium @edge — Change metric operator and severity in one form", async ({
    page,
  }) => {
    const alerts = await openNewRuleForm(page);
    await alerts.selectFieldOption("Metric", "interruption_count");
    await alerts.selectFieldOption("Operator", ">=");
    await alerts.selectFieldOption("Severity", "info");
    await alerts.valueInput().fill("5");
    await alerts.expectCreateRuleFormVisible();
  });

  test("TC-AL-E106 @medium @edge — Long rule name accepted in Name field", async ({
    page,
  }) => {
    const alerts = await openNewRuleForm(page);
    await alerts.nameInput().fill(ALERTS_SAMPLES.longName);
    await expect(alerts.nameInput()).toHaveValue(ALERTS_SAMPLES.longName);
  });

  test("TC-AL-E107 @medium @edge — Open rule form cancel then open channel form", async ({
    page,
  }) => {
    const alerts = await openNewRuleForm(page);
    await alerts.cancelForm();
    await alerts.channelsTab().click();
    await alerts.clickAddChannel();
    await alerts.expectAddChannelFormVisible();
  });

  test("TC-AL-E108 @medium @edge @manual — Alert fires and appears in Recent events", async () => {
    test.skip(
      true,
      "Manual/telephony: trigger metric threshold, verify event in Recent events",
    );
  });
});
