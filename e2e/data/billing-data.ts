/** SETTINGS › Billing — copy and options from UI. */

export const BILLING_COPY = {
  subtitle: /Usage and cost by provider/i,
  totalMinutesLabel: /TOTAL MINUTES/i,
  usageOverTime: /Usage over time/i,
  noUsageInWindow: /No usage recorded in the selected window/i,
  noUsageInPeriod: /No usage recorded in this period/i,
} as const;

export const BILLING_TIME_RANGES = [
  "This month",
  "Last 30 days",
  "All time",
] as const;

export const BILLING_DEFAULT_TIME_RANGE = "This month" as const;

export const BILLING_USAGE_INTERVALS = ["day", "week", "month"] as const;

export const BILLING_DEFAULT_INTERVAL = "day" as const;

export const BILLING_EMPTY_KPI = /^0\.0$|^0$/;
