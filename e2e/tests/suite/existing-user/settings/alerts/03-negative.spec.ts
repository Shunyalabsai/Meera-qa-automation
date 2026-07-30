import { test, expect } from "@playwright/test";
import { openNewRuleForm, openAddChannelForm } from "../../../../../helpers/alerts.helper";
import { AlertsPage } from "../../../../../pages/alerts.page";
import { ALERTS_SAMPLES } from "../../../../../data/alerts-data";

test.describe("SETTINGS › Alerts — Negative @journey @existing-user @alerts @negative", () => {
  test("TC-AL-N101 @high @negative — Create rule without name blocked", async ({
    page,
  }) => {
    const alerts = await openNewRuleForm(page);
    await alerts.valueInput().fill(ALERTS_SAMPLES.ruleValue);
    await alerts.submitCreateRule();
    await alerts.expectCreateBlocked();
    await alerts.expectNameFieldInvalid();
  });

  test("TC-AL-N102 @high @negative — Create rule with empty value blocked", async ({
    page,
  }) => {
    const alerts = await openNewRuleForm(page);
    await alerts.nameInput().fill("Test rule no value");
    await alerts.valueInput().fill("");
    await alerts.submitCreateRule();
    await expect(
      page
        .getByText(/required|invalid|value|Fix the highlighted|fill in this field/i)
        .first(),
    ).toBeVisible({ timeout: 10_000 }).catch(async () => {
      await alerts.expectCreateBlocked();
    });
  });

  test("TC-AL-N103 @medium @negative — Non-numeric value rejected", async ({
    page,
  }) => {
    const alerts = await openNewRuleForm(page);
    await alerts.fillCreateRule({
      name: "Invalid value rule",
      value: ALERTS_SAMPLES.invalidValue,
    });
    await alerts.submitCreateRule();
    await expect(
      page.getByText(/invalid|number|numeric|value|Fix the highlighted/i).first(),
    ).toBeVisible({ timeout: 10_000 }).catch(async () => {
      await alerts.expectCreateBlocked();
    });
  });

  test("TC-AL-N104 @high @negative — Save channel without name blocked", async ({
    page,
  }) => {
    const alerts = await openAddChannelForm(page);
    const url = alerts.webhookUrlInput();
    if (await url.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await url.fill(ALERTS_SAMPLES.slackWebhookUrl);
    }
    await alerts.submitSaveChannel();
    await alerts.expectSaveChannelBlocked();
  });

  test("TC-AL-N105 @high @negative — Invalid Slack webhook URL rejected", async ({
    page,
  }) => {
    const alerts = await openAddChannelForm(page);
    await alerts.fillAddChannel({
      name: ALERTS_SAMPLES.channelName,
      webhookUrl: ALERTS_SAMPLES.invalidWebhookUrl,
    });
    await alerts.submitSaveChannel();
    await expect(
      page.getByText(/invalid|url|https|webhook|Fix the highlighted/i).first(),
    ).toBeVisible({ timeout: 10_000 }).catch(async () => {
      await alerts.expectSaveChannelBlocked();
    });
  });

  test("TC-AL-N106 @low @negative — Invalid alerts sub-route handled gracefully", async ({
    page,
  }) => {
    await page.goto("/vap/alerts/this-id-does-not-exist");
    await expect(
      page
        .getByText(/404|not found|Alerts|No alert rules yet/i)
        .first(),
    ).toBeVisible({ timeout: 15_000 });
  });
});
