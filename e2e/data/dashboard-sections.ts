/**
 * Dashboard navigation structure — mirrors the Meera VAP sidebar.
 *
 * BUILD    → Agents, Prompts, Playground
 * RUN      → Campaigns, Phone numbers, Live Calls
 * ANALYZE  → Calls, Recordings, Insights
 * SETTINGS → Alerts, Billing, Webhooks
 */
export type DashboardGroup = "BUILD" | "RUN" | "ANALYZE" | "SETTINGS" | null;

export type DashboardSection = {
  id: string;
  folder: string;
  label: string;
  group: DashboardGroup;
  route: string | null;
  /** Google Sheet tab names whose cases live under this dashboard section */
  sheetTabs: string[];
};

export const DASHBOARD_SECTIONS: DashboardSection[] = [
  {
    id: "authentication",
    folder: "authentication",
    label: "Authentication",
    group: null,
    route: null,
    sheetTabs: ["Authentication & Login"],
  },
  {
    id: "build-agents",
    folder: "build/agents",
    label: "Agents",
    group: "BUILD",
    route: "agents",
    sheetTabs: ["Agent Builder / Configuration"],
  },
  {
    id: "build-prompts",
    folder: "build/prompts",
    label: "Prompts",
    group: "BUILD",
    route: "prompts",
    sheetTabs: ["Knowledge Base & Prompt Configuration"],
  },
  {
    id: "build-playground",
    folder: "build/playground",
    label: "Playground",
    group: "BUILD",
    route: "playground",
    sheetTabs: [],
  },
  {
    id: "run-campaigns",
    folder: "run/campaigns",
    label: "Campaigns",
    group: "RUN",
    route: "campaigns",
    sheetTabs: [],
  },
  {
    id: "run-phone-numbers",
    folder: "run/phone-numbers",
    label: "Phone numbers",
    group: "RUN",
    route: "phone-numbers",
    sheetTabs: [],
  },
  {
    id: "run-live-calls",
    folder: "run/live-calls",
    label: "Live Calls",
    group: "RUN",
    route: "live-calls",
    sheetTabs: [],
  },
  {
    id: "analyze-calls",
    folder: "analyze/calls",
    label: "Calls",
    group: "ANALYZE",
    route: "calls",
    sheetTabs: ["Analytics & Dashboard"],
  },
  {
    id: "analyze-recordings",
    folder: "analyze/recordings",
    label: "Recordings",
    group: "ANALYZE",
    route: "recordings",
    sheetTabs: [],
  },
  {
    id: "analyze-insights",
    folder: "analyze/insights",
    label: "Insights",
    group: "ANALYZE",
    route: "insights",
    sheetTabs: [],
  },
  {
    id: "settings-alerts",
    folder: "settings/alerts",
    label: "Alerts",
    group: "SETTINGS",
    route: "alerts",
    sheetTabs: [],
  },
  {
    id: "settings-billing",
    folder: "settings/billing",
    label: "Billing",
    group: "SETTINGS",
    route: "billing",
    sheetTabs: [],
  },
  {
    id: "settings-webhooks",
    folder: "settings/webhooks",
    label: "Webhooks",
    group: "SETTINGS",
    route: "admin/webhooks",
    sheetTabs: ["Integrations & Webhooks"],
  },
  {
    id: "workspace",
    folder: "workspace",
    label: "Workspace & Account",
    group: null,
    route: null,
    sheetTabs: [],
  },
  {
    id: "global",
    folder: "global",
    label: "Global UI",
    group: null,
    route: null,
    sheetTabs: ["UI / UX Testing", "Performance Testing", "Edge Cases", "Security Testing"],
  },
];

/** Voice Call sheet cases are routed to the dashboard section that owns the feature. */
export function dashboardSectionIdForCase(caseId: string, caseName = ""): string {
  const n = caseName.toLowerCase();

  if (caseId.startsWith("TC-AU")) return "authentication";
  if (caseId.startsWith("TC-AG")) return "build-agents";
  if (caseId.startsWith("TC-KB")) return "build-prompts";
  if (caseId.startsWith("TC-IN")) return "settings-webhooks";
  if (caseId.startsWith("TC-UI")) return "global";
  if (caseId.startsWith("TC-PF") || caseId.startsWith("TC-EC") || caseId.startsWith("TC-SC")) {
    return "global";
  }

  if (caseId.startsWith("TC-AN")) {
    if (/live|monitor|real-time/i.test(n)) return "run-live-calls";
    if (/insight|sentiment|dashboard/i.test(n)) return "analyze-insights";
    return "analyze-calls";
  }

  if (caseId.startsWith("TC-VC")) {
    if (/recording/i.test(n)) return "analyze-recordings";
    if (/phone number|outbound|dtmf|invalid phone|concurrent|spoof/i.test(n)) {
      return "run-phone-numbers";
    }
    if (/live|monitor|inbound call received/i.test(n)) return "run-live-calls";
    if (/transcript|call log|pii|encryption/i.test(n)) return "analyze-calls";
    if (/webhook|ssrf|rate limiting|mass outbound/i.test(n)) return "settings-webhooks";
    return "build-playground";
  }

  return "global";
}

export function getDashboardSection(id: string): DashboardSection | undefined {
  return DASHBOARD_SECTIONS.find((s) => s.id === id);
}

export function dashboardLabel(id: string): string {
  const section = getDashboardSection(id);
  if (!section) return id;
  return section.group ? `${section.group} › ${section.label}` : section.label;
}
