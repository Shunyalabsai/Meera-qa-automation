/** ANALYZE › Insights — copy and sample inputs from UI. */

export const INSIGHTS_COPY = {
  emptyCampaign: /No campaign data for this period/i,
  agentFilterDefault: /All agents/i,
  datePlaceholder: /dd\/mm\/yyyy/i,
} as const;

export const INSIGHTS_KPI_LABELS = [
  "TOTAL CALLS",
  "AVG DURATION",
  "COMPLETION RATE",
  "AVG EVAL SCORE",
  "TOTAL TURNS",
] as const;

export const INSIGHTS_KPI_EMPTY = {
  totalCalls: /^0$/,
  avgDuration: /0s/i,
  completionRate: /0\.0%/i,
  avgEvalScore: /—|-/,
  totalTurns: /^0$/,
} as const;

export const INSIGHTS_CHART_TITLES = [
  "Calls Over Time",
  "Outcome Distribution",
  "Call Distribution",
  "Agent Performance",
  "Sentiment Trends",
  "Campaign Performance",
] as const;

export const INSIGHTS_DATE_PRESETS = [
  "Last 7 days",
  "Last 30 days",
  "Last 90 days",
  "All time",
] as const;

/** Clickable tabs in the top-right date range control (not plain text). */
export const INSIGHTS_DEFAULT_DATE_PRESET = "Last 30 days" as const;

export const INSIGHTS_HEATMAP_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export const INSIGHTS_SAMPLES = {
  invalidDate: "not-a-date",
  futureFrom: "2099-01-01",
  futureTo: "2099-12-31",
  reversedFrom: "2025-12-31",
  reversedTo: "2025-01-01",
} as const;

export const INSIGHTS_CAMPAIGN_COLUMNS = [
  "Campaign",
  "Total Calls",
  "Completed",
  "Failed",
  "Avg Duration",
] as const;
