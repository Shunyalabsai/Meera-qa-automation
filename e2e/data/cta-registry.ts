/**
 * Central registry of dashboard CTAs — used for audit docs and functional specs.
 * Each entry: section, label, type, route context.
 */
export type CtaType = "button" | "link" | "tab" | "submit" | "combobox" | "radio" | "checkbox";

export type CtaEntry = {
  id: string;
  section: string;
  label: string;
  type: CtaType;
  /** Where the CTA lives (page or sub-view) */
  context: string;
};

export const DASHBOARD_CTAS: CtaEntry[] = [
  // BUILD › Agents
  { id: "AG-001", section: "build/agents", label: "Create your first agent", type: "link", context: "onboarding" },
  { id: "AG-002", section: "build/agents", label: "Create an agent", type: "link", context: "onboarding-step" },
  { id: "AG-003", section: "build/agents", label: "Add a phone number", type: "link", context: "onboarding-step" },
  { id: "AG-004", section: "build/agents", label: "Test in Playground", type: "link", context: "onboarding-step" },
  { id: "AG-005", section: "build/agents", label: "New agent", type: "link", context: "list" },
  { id: "AG-006", section: "build/agents", label: "Clone", type: "button", context: "list-row" },
  { id: "AG-007", section: "build/agents", label: "Delete", type: "button", context: "list-row" },
  { id: "AG-008", section: "build/agents", label: "Start from scratch", type: "button", context: "gallery" },
  { id: "AG-009", section: "build/agents", label: "Create agent", type: "submit", context: "form" },
  { id: "AG-010", section: "build/agents", label: "Save changes", type: "submit", context: "form-edit" },
  { id: "AG-011", section: "build/agents", label: "Edit", type: "link", context: "detail" },
  { id: "AG-012", section: "build/agents", label: "Playground", type: "link", context: "detail" },
  { id: "AG-013", section: "build/agents", label: "Customise outcomes", type: "button", context: "outcomes-tab" },
  { id: "AG-014", section: "build/agents", label: "Add outcome", type: "button", context: "outcomes-tab" },
  // BUILD › Prompts
  { id: "PT-001", section: "build/prompts", label: "New template", type: "button", context: "list" },
  { id: "PT-002", section: "build/prompts", label: "Add variable", type: "button", context: "create-form" },
  { id: "PT-003", section: "build/prompts", label: "Create", type: "submit", context: "create-form" },
  { id: "PT-004", section: "build/prompts", label: "Cancel", type: "button", context: "create-form" },
  { id: "PT-005", section: "build/prompts", label: "Delete", type: "button", context: "list-row" },
  // BUILD › Playground
  { id: "PG-001", section: "build/playground", label: "Browser", type: "button", context: "mode-toggle" },
  { id: "PG-002", section: "build/playground", label: "Phone Call", type: "button", context: "mode-toggle" },
  { id: "PG-003", section: "build/playground", label: "Start call", type: "button", context: "browser-mode" },
  { id: "PG-004", section: "build/playground", label: "Start Phone Call", type: "button", context: "phone-mode" },
  // RUN › Campaigns
  { id: "CM-001", section: "run/campaigns", label: "New campaign", type: "button", context: "list" },
  { id: "CM-002", section: "run/campaigns", label: "Create", type: "submit", context: "create-form" },
  { id: "CM-003", section: "run/campaigns", label: "Cancel", type: "button", context: "create-form" },
  { id: "CM-004", section: "run/campaigns", label: "Add one in Phone Numbers", type: "link", context: "create-form" },
  // RUN › Phone numbers
  { id: "PN-001", section: "run/phone-numbers", label: "Add number", type: "button", context: "list" },
  { id: "PN-002", section: "run/phone-numbers", label: "Add number", type: "submit", context: "modal" },
  { id: "PN-003", section: "run/phone-numbers", label: "Cancel", type: "button", context: "modal" },
  // RUN › Live Calls
  { id: "LC-001", section: "run/live-calls", label: "Playground", type: "link", context: "empty-state" },
  // ANALYZE › Calls
  { id: "CL-001", section: "analyze/calls", label: "Go", type: "button", context: "search" },
  { id: "CL-002", section: "analyze/calls", label: "Export", type: "button", context: "list" },
  // ANALYZE › Recordings
  { id: "RC-001", section: "analyze/recordings", label: "Search", type: "submit", context: "search" },
  // ANALYZE › Insights
  { id: "IS-001", section: "analyze/insights", label: "Last 7 days", type: "tab", context: "date-presets" },
  { id: "IS-002", section: "analyze/insights", label: "Last 30 days", type: "tab", context: "date-presets" },
  { id: "IS-003", section: "analyze/insights", label: "Last 90 days", type: "tab", context: "date-presets" },
  { id: "IS-004", section: "analyze/insights", label: "All time", type: "tab", context: "date-presets" },
  // SETTINGS › Alerts
  { id: "AL-001", section: "settings/alerts", label: "New rule", type: "button", context: "rules" },
  { id: "AL-002", section: "settings/alerts", label: "Create rule", type: "submit", context: "rule-form" },
  { id: "AL-003", section: "settings/alerts", label: "Add channel", type: "button", context: "channels" },
  { id: "AL-004", section: "settings/alerts", label: "Save channel", type: "submit", context: "channel-form" },
  { id: "AL-005", section: "settings/alerts", label: "Cancel", type: "button", context: "form" },
  { id: "AL-006", section: "settings/alerts", label: "Rules", type: "tab", context: "tabs" },
  { id: "AL-007", section: "settings/alerts", label: "Channels", type: "tab", context: "tabs" },
  // SETTINGS › Billing
  { id: "BL-001", section: "settings/billing", label: "Billing", type: "link", context: "sidebar" },
  { id: "BL-002", section: "settings/billing", label: "This month", type: "combobox", context: "time-range" },
  { id: "BL-003", section: "settings/billing", label: "Last 30 days", type: "combobox", context: "time-range" },
  { id: "BL-004", section: "settings/billing", label: "All time", type: "combobox", context: "time-range" },
  { id: "BL-005", section: "settings/billing", label: "day", type: "tab", context: "usage-interval" },
  { id: "BL-006", section: "settings/billing", label: "week", type: "tab", context: "usage-interval" },
  { id: "BL-007", section: "settings/billing", label: "month", type: "tab", context: "usage-interval" },
  { id: "LG-001", section: "global/language", label: "Language trigger", type: "button", context: "sidebar" },
  { id: "LG-002", section: "global/language", label: "Search language", type: "input", context: "language-panel" },
  { id: "LG-003", section: "global/language", label: "Language option", type: "option", context: "language-list" },
  { id: "LG-004", section: "global/language", label: "Close language menu", type: "button", context: "backdrop" },
  // SETTINGS › Webhooks
  { id: "WH-001", section: "settings/webhooks", label: "Select all", type: "button", context: "quick-apply" },
  { id: "WH-002", section: "settings/webhooks", label: "Clear", type: "button", context: "quick-apply" },
  { id: "WH-003", section: "settings/webhooks", label: "Apply to N events", type: "submit", context: "quick-apply" },
  { id: "WH-004", section: "settings/webhooks", label: "Subscribe", type: "button", context: "event-row" },
  { id: "WH-005", section: "settings/webhooks", label: "Save subscription", type: "submit", context: "per-event-form" },
  { id: "WH-006", section: "settings/webhooks", label: "Cancel", type: "button", context: "per-event-form" },
  { id: "WH-007", section: "settings/webhooks", label: "Subscribe to a custom event type", type: "link", context: "custom-event" },
  { id: "WH-008", section: "settings/webhooks", label: "Create", type: "submit", context: "custom-event-form" },
  { id: "WH-009", section: "settings/webhooks", label: "Cancel", type: "button", context: "custom-event-form" },
  { id: "WH-010", section: "settings/webhooks", label: "Webhooks", type: "link", context: "sidebar" },
];

export function ctasForSection(sectionFolder: string): CtaEntry[] {
  return DASHBOARD_CTAS.filter((c) => c.section === sectionFolder);
}
