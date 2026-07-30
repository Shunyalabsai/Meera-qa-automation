/** Shared skip reasons when staging keeps data for existing-user coverage. */
export const STAGING_EMPTY_SKIP = {
  insights:
    "Insights has call data — retained for existing-user testing; empty-state @new-user tests skip",
  calls:
    "Call records exist — retained for existing-user testing; empty-state @new-user tests skip",
  billing:
    "Billing usage data exists — retained for existing-user testing; empty-state @new-user tests skip",
} as const;

/** Skip when workspace lacks data required for @existing-user tests. */
export const STAGING_HAS_DATA_SKIP = {
  agents: "No agents in workspace — @existing-user tests need at least one agent",
  calls: "No call records — @existing-user tests need completed calls on staging",
  recordings:
    "No recordings — @existing-user tests need call recordings on staging",
  insights:
    "Insights KPIs are empty — @existing-user tests need call history on staging",
  billing:
    "Billing has no usage — @existing-user tests need usage minutes on staging",
  campaigns:
    "No campaigns — @existing-user tests need at least one campaign",
  phoneNumbers:
    "No phone numbers — @existing-user tests need registered numbers",
  liveCalls:
    "No live calls — @existing-user tests need active or recent live calls",
  alerts: "No alert rules — @existing-user tests need configured rules",
  webhooks:
    "No webhook subscriptions — @existing-user tests need active subscriptions",
  prompts:
    "No prompt templates — @existing-user tests need saved templates",
} as const;
