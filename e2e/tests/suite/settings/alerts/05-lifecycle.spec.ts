import { test, expect } from "@playwright/test";
import { openNewRuleForm, openAddChannelForm } from "../../../../helpers/alerts.helper";
import { ALERTS_SAMPLES } from "../../../../data/alerts-data";
import { uniqueName } from "../../../../utils/test-data";

test.describe("SETTINGS › Alerts — Lifecycle @journey @alerts @serial @cta", () => {
  test.describe.configure({ mode: "serial" });

  const ruleName = uniqueName("alert_rule");
  const channelName = uniqueName("slack_channel");

  test("CTA-AL-001 @high @cta — Create rule submit persists rule in list", async ({
    page,
  }) => {
    const alerts = await openNewRuleForm(page);
    await alerts.fillCreateRule({
      name: ruleName,
      value: ALERTS_SAMPLES.ruleValue,
    });
    await alerts.submitCreateRule();
    await expect(page.getByText(ruleName, { exact: false })).toBeVisible({
      timeout: 30_000,
    });
  });

  test("CTA-AL-002 @high @cta — Save channel submit persists channel in list", async ({
    page,
  }) => {
    const alerts = await openAddChannelForm(page);
    await alerts.fillAddChannel({
      name: channelName,
      kind: "slack",
      webhookUrl: ALERTS_SAMPLES.slackWebhookUrl,
    });
    await alerts.submitSaveChannel();
    await expect(page.getByText(channelName, { exact: false })).toBeVisible({
      timeout: 30_000,
    });
  });
});
