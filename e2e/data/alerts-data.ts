/** SETTINGS › Alerts — copy, options, and sample inputs from UI. */

export const ALERTS_COPY = {
  subtitle: /Threshold rules that fire on call metrics/i,
  rulesEmpty: /No alert rules yet/i,
  eventsEmpty: /No alerts have fired yet/i,
  channelsEmpty: /No channels configured/i,
  channelsHint: /Slack webhook|outbound webhook/i,
  slackUrlPlaceholder: /hooks\.slack\.com\/services/i,
  defaultChannelLabel: /Default channel/i,
} as const;

export const ALERT_METRICS = [
  "duration_secs",
  "eval_score",
  "interruption_count",
  "sentiment",
  "outcome",
] as const;

export const ALERT_OPERATORS = ["<", "<=", ">", ">=", "==", "!="] as const;

export const ALERT_SEVERITIES = ["info", "warn", "critical"] as const;

export const CHANNEL_KINDS = ["slack", "webhook", "email (stub)"] as const;

export const ALERTS_DEFAULTS = {
  metric: "duration_secs",
  operator: ">",
  value: "60",
  severity: "warn",
} as const;

export const ALERTS_SAMPLES = {
  ruleValue: "120",
  invalidValue: "not-a-number",
  longName: "Rule_" + "X".repeat(100),
  channelName: "Test Slack Channel",
  invalidWebhookUrl: "not-a-valid-url",
  slackWebhookUrl: "https://hooks.slack.com/services/T000/B000/XXXX",
  webhookUrl: "https://example.com/webhook/alerts",
} as const;
