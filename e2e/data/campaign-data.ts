/** Sample data for RUN › Campaigns create form. */

export const CAMPAIGN_SAMPLES = {
  name: "E2E Outbound Campaign",
  description: "Test campaign for contact upload and batch dispatch",
  maxConcurrent: 5,
  retryMaxAttempts: 2,
  retryBackoffSecs: 60,
} as const;

export const CAMPAIGN_DEFAULTS = {
  maxConcurrent: "5",
  retryMaxAttempts: "2",
  retryBackoffSecs: "60",
} as const;
