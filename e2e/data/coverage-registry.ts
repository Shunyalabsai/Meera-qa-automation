/**
 * Maps QA sheet TC IDs to automated Playwright tests.
 * `section` = dashboard folder path under e2e/tests/suite/
 */
export type AutomatedCase = {
  section: string;
  spec: string;
  title: string;
};

export const AUTOMATED_CASES: Record<string, AutomatedCase> = {
  // ── Authentication ───────────────────────────────────────────────────
  "TC-AU-002": {
    section: "authentication",
    spec: "sign-in/sign-in.positive.spec.ts",
    title: "Sign-in page shows Google, GitHub, and email fields",
  },
  "TC-AU-002b": {
    section: "authentication",
    spec: "google-sso/google-sso.spec.ts",
    title: "Google SSO session reaches Agents dashboard",
  },
  "TC-AU-004": {
    section: "authentication",
    spec: "logout/sign-out.spec.ts",
    title: "Logout clears session",
  },
  "TC-AU-101": {
    section: "authentication",
    spec: "sign-in/sign-in.negative.spec.ts",
    title: "Wrong password shows error",
  },
  "TC-AU-103": {
    section: "authentication",
    spec: "sign-in/sign-in.negative.spec.ts",
    title: "Blank email/password validation",
  },
  "TC-AU-202": {
    section: "authentication",
    spec: "sign-in/sign-in.security.spec.ts",
    title: "XSS payload sanitized in email field",
  },
  "TC-AU-SU-001": {
    section: "authentication",
    spec: "sign-up/sign-up.landing.spec.ts",
    title: "Create your account screen loads",
  },
  "TC-AU-SU-008": {
    section: "authentication",
    spec: "sign-up/sign-up.verification.spec.ts",
    title: "Continue opens Verify your email screen",
  },

  // ── BUILD › Agents (Debt recovery journey) ─────────────────────────────
  "TC-AG-001": {
    section: "build/agents",
    spec: "debt-recovery/09-lifecycle.spec.ts",
    title: "Create debt recovery agent",
  },
  "TC-AG-002": {
    section: "build/agents",
    spec: "debt-recovery/09-lifecycle.spec.ts",
    title: "Edit system prompt and save",
  },
  "TC-AG-003": {
    section: "build/agents",
    spec: "debt-recovery/11-poc-manual-gaps.spec.ts",
    title: "STT model (POC hidden — skipped)",
  },
  "TC-AG-004": {
    section: "build/agents",
    spec: "debt-recovery/09-lifecycle.spec.ts",
    title: "Change language on edit",
  },
  "TC-AG-005": {
    section: "build/agents",
    spec: "debt-recovery/09-lifecycle.spec.ts",
    title: "Edit temperature and max tokens",
  },
  "TC-AG-006": {
    section: "build/agents",
    spec: "debt-recovery/09-lifecycle.spec.ts",
    title: "Clone agent",
  },
  "TC-AG-007": {
    section: "build/agents",
    spec: "debt-recovery/09-lifecycle.spec.ts",
    title: "Delete agent",
  },
  "TC-AG-008": {
    section: "build/agents",
    spec: "debt-recovery/11-poc-manual-gaps.spec.ts",
    title: "Enable/disable toggle (skipped if no UI)",
  },
  "TC-AG-009": {
    section: "build/agents",
    spec: "debt-recovery/09-lifecycle.spec.ts",
    title: "Enable escalation with handoff target",
  },
  "TC-AG-010": {
    section: "build/agents",
    spec: "debt-recovery/09-lifecycle.spec.ts",
    title: "Edit first message",
  },
  "TC-AG-101": {
    section: "build/agents",
    spec: "templates/edge-cases.spec.ts",
    title: "Empty name blocked (all template cards)",
  },
  "TC-AG-102": {
    section: "build/agents",
    spec: "templates/edge-cases.spec.ts",
    title: "Name character limit (all template cards)",
  },
  "TC-AG-103": {
    section: "build/agents",
    spec: "debt-recovery/11-poc-manual-gaps.spec.ts",
    title: "No STT model (POC hidden — skipped)",
  },
  "TC-AG-104": {
    section: "build/agents",
    spec: "templates/edge-cases.spec.ts",
    title: "Invalid temperature blocked (all template cards)",
  },
  "TC-AG-105": {
    section: "build/agents",
    spec: "debt-recovery/11-poc-manual-gaps.spec.ts",
    title: "Delete mid-call (manual — skipped)",
  },
  "TC-AG-106": {
    section: "build/agents",
    spec: "templates/edge-cases.spec.ts",
    title: "XSS in name (all template cards)",
  },
  "TC-AG-201": {
    section: "build/agents",
    spec: "debt-recovery/11-poc-manual-gaps.spec.ts",
    title: "Cross-org access (security — skipped)",
  },
  "TC-AG-202": {
    section: "build/agents",
    spec: "debt-recovery/11-poc-manual-gaps.spec.ts",
    title: "Prompt injection API (security — skipped)",
  },
  "TC-AG-203": {
    section: "build/agents",
    spec: "debt-recovery/11-poc-manual-gaps.spec.ts",
    title: "Unauthorized API modify (security — skipped)",
  },
  "TC-AG-DR-001": {
    section: "build/agents",
    spec: "debt-recovery/00-template.spec.ts",
    title: "Debt recovery card opens pre-filled form",
  },
  "TC-AG-DR-002": {
    section: "build/agents",
    spec: "debt-recovery/00-template.spec.ts",
    title: "Change template link returns to gallery",
  },
  "TC-AG-DR-060": {
    section: "build/agents",
    spec: "debt-recovery/07-full-journey.spec.ts",
    title: "All tabs configured → agent created",
  },
  "TC-AG-DR-070": {
    section: "build/agents",
    spec: "debt-recovery/08-tabs-navigation.spec.ts",
    title: "All five tabs navigate in order",
  },

  // ── BUILD › Agents (Order confirmation journey) ────────────────────────
  "TC-AG-OC-001": {
    section: "build/agents",
    spec: "order-confirmation/00-template.spec.ts",
    title: "Order confirmation card opens pre-filled form",
  },
  "TC-AG-OC-060": {
    section: "build/agents",
    spec: "order-confirmation/07-full-journey.spec.ts",
    title: "All tabs configured → agent created",
  },
  "TC-AG-OC-080": {
    section: "build/agents",
    spec: "order-confirmation/09-lifecycle.spec.ts",
    title: "Order confirmation full lifecycle",
  },

  // ── BUILD › Agents (Appointment reminder journey) ────────────────────────
  "TC-AG-AR-001": {
    section: "build/agents",
    spec: "appointment-reminder/00-template.spec.ts",
    title: "Appointment reminder card opens pre-filled form",
  },
  "TC-AG-AR-060": {
    section: "build/agents",
    spec: "appointment-reminder/07-full-journey.spec.ts",
    title: "All tabs configured → agent created",
  },
  "TC-AG-AR-080": {
    section: "build/agents",
    spec: "appointment-reminder/09-lifecycle.spec.ts",
    title: "Appointment reminder full lifecycle",
  },

  // ── BUILD › Agents (Customer support journey) ────────────────────────────
  "TC-AG-CS-001": {
    section: "build/agents",
    spec: "customer-support/00-template.spec.ts",
    title: "Customer support card opens pre-filled form",
  },
  "TC-AG-CS-060": {
    section: "build/agents",
    spec: "customer-support/07-full-journey.spec.ts",
    title: "All tabs configured → agent created",
  },
  "TC-AG-CS-080": {
    section: "build/agents",
    spec: "customer-support/09-lifecycle.spec.ts",
    title: "Customer support full lifecycle",
  },

  // ── BUILD › Agents (Start from scratch journey) ──────────────────────────
  "TC-AG-SFS-001": {
    section: "build/agents",
    spec: "start-from-scratch/00-template.spec.ts",
    title: "Start from scratch opens blank form with neutral defaults",
  },
  "TC-AG-SFS-060": {
    section: "build/agents",
    spec: "start-from-scratch/07-full-journey.spec.ts",
    title: "Blank form fully configured → agent created",
  },
  "TC-AG-SFS-080": {
    section: "build/agents",
    spec: "start-from-scratch/09-lifecycle.spec.ts",
    title: "Start from scratch full lifecycle",
  },

  // ── BUILD › Agents (New user onboarding — main screen) ───────────────────
  "TC-AG-ON-001": {
    section: "build/agents",
    spec: "onboarding/00-agents-main.spec.ts",
    title: "Empty state shows Build your first voice agent hero",
  },
  "TC-AG-ON-010": {
    section: "build/agents",
    spec: "onboarding/01-step-navigation.spec.ts",
    title: "Create your first agent CTA opens /agents/new",
  },
  "TC-AG-ON-012": {
    section: "build/agents",
    spec: "onboarding/01-step-navigation.spec.ts",
    title: "Add a phone number step opens Phone numbers page",
  },
  "TC-AG-ON-013": {
    section: "build/agents",
    spec: "onboarding/01-step-navigation.spec.ts",
    title: "Test in Playground step opens Playground page",
  },
  "TC-AG-ON-020": {
    section: "build/agents",
    spec: "onboarding/01-step-navigation.spec.ts",
    title: "Phone numbers empty state for new user",
  },
  "TC-AG-ON-030": {
    section: "build/agents",
    spec: "onboarding/01-step-navigation.spec.ts",
    title: "Playground new-user layout (picker, modes, log)",
  },

  // ── BUILD › Prompts ────────────────────────────────────────────────────
  "TC-KB-001": {
    section: "build/prompts",
    spec: "prompts.spec.ts",
    title: "Prompt Templates page loads",
  },
  "TC-PT-001": {
    section: "build/prompts",
    spec: "00-list-empty-state.spec.ts",
    title: "Empty state shows no templates message",
  },
  "TC-PT-030": {
    section: "build/prompts",
    spec: "03-create-positive.spec.ts",
    title: "Create template with name, category, and base prompt",
  },
  "TC-PT-040": {
    section: "build/prompts",
    spec: "05-lifecycle.spec.ts",
    title: "Prompt template lifecycle",
  },

  // ── BUILD › Playground ─────────────────────────────────────────────────
  "TC-VC-101": {
    section: "build/playground",
    spec: "03-negative.spec.ts",
    title: "Invalid phone number rejected on outbound dial",
  },
  "TC-PG-001": {
    section: "build/playground",
    spec: "00-main-ui.spec.ts",
    title: "Playground header and agent picker",
  },
  "TC-PG-020": {
    section: "build/playground",
    spec: "02-phone-mode.spec.ts",
    title: "Phone Call mode Plivo dial panel",
  },
  "TC-PG-N101": {
    section: "build/playground",
    spec: "03-negative.spec.ts",
    title: "Start browser call without agent",
  },

  // ── RUN › Phone numbers ────────────────────────────────────────────────
  "TC-PN-001": {
    section: "run/phone-numbers",
    spec: "00-list-empty-state.spec.ts",
    title: "Empty state shows No phone numbers registered yet",
  },
  "TC-PN-010": {
    section: "run/phone-numbers",
    spec: "01-add-number-modal.spec.ts",
    title: "Add phone number modal with Plivo defaults",
  },
  "TC-PN-N101": {
    section: "run/phone-numbers",
    spec: "02-negative.spec.ts",
    title: "Add number without required fields blocked",
  },

  // ── RUN › Campaigns ────────────────────────────────────────────────────
  "TC-CM-001": {
    section: "run/campaigns",
    spec: "00-list-empty-state.spec.ts",
    title: "Empty state shows No campaigns yet",
  },
  "TC-CM-020": {
    section: "run/campaigns",
    spec: "02-phone-numbers-link.spec.ts",
    title: "Add one in Phone Numbers link navigates to phone-numbers",
  },
  "TC-CM-N101": {
    section: "run/campaigns",
    spec: "03-negative.spec.ts",
    title: "Create without agent selected is blocked",
  },

  // ── RUN › Live Calls ───────────────────────────────────────────────────
  "TC-LC-001": {
    section: "run/live-calls",
    spec: "00-empty-state.spec.ts",
    title: "Empty state shows No calls in progress right now",
  },
  "TC-AN-006": {
    section: "run/live-calls",
    spec: "00-empty-state.spec.ts",
    title: "Real-time call monitoring dashboard loads",
  },
  "TC-LC-010": {
    section: "run/live-calls",
    spec: "01-positive.spec.ts",
    title: "Live Calls page loads at /live-calls",
  },

  // ── ANALYZE › Calls ────────────────────────────────────────────────────
  "TC-AN-001": {
    section: "analyze/calls",
    spec: "calls.spec.ts",
    title: "View call logs after completed calls",
  },
  "TC-AN-002": {
    section: "analyze/calls",
    spec: "01-filters-positive.spec.ts",
    title: "State filter combobox visible",
  },
  "TC-CL-001": {
    section: "analyze/calls",
    spec: "00-main-ui.spec.ts",
    title: "Empty state shows No calls found",
  },
  "TC-CL-010": {
    section: "analyze/calls",
    spec: "01-filters-positive.spec.ts",
    title: "Calls page loads at /calls",
  },
  "TC-AN-N101": {
    section: "analyze/calls",
    spec: "03-negative.spec.ts",
    title: "Invalid call ID search shows no results",
  },

  // ── ANALYZE › Recordings ───────────────────────────────────────────────
  "TC-RC-001": {
    section: "analyze/recordings",
    spec: "recordings.spec.ts",
    title: "Recordings page loads",
  },
  "TC-RC-002": {
    section: "analyze/recordings",
    spec: "01-filters-positive.spec.ts",
    title: "Empty state or recordings table",
  },
  "TC-RC-003": {
    section: "analyze/recordings",
    spec: "00-main-ui.spec.ts",
    title: "Empty state shows No recordings found",
  },
  "TC-RC-010": {
    section: "analyze/recordings",
    spec: "01-filters-positive.spec.ts",
    title: "Recordings page loads at /recordings",
  },
  "TC-RC-N101": {
    section: "analyze/recordings",
    spec: "03-negative.spec.ts",
    title: "Invalid Call ID search shows no recordings",
  },

  // ── ANALYZE › Insights ─────────────────────────────────────────────────
  "TC-AN-004": {
    section: "analyze/insights",
    spec: "insights.spec.ts",
    title: "Insights dashboard loads",
  },
  "TC-IS-001": {
    section: "analyze/insights",
    spec: "00-main-ui.spec.ts",
    title: "Empty KPIs show zero values",
  },
  "TC-IS-010": {
    section: "analyze/insights",
    spec: "01-filters-positive.spec.ts",
    title: "Insights page loads at /insights",
  },
  "TC-IS-N101": {
    section: "analyze/insights",
    spec: "03-negative.spec.ts",
    title: "Date from after date to handled gracefully",
  },

  // ── SETTINGS › Alerts ──────────────────────────────────────────────────
  "TC-AL-001": {
    section: "settings/alerts",
    spec: "alerts.spec.ts",
    title: "Alerts page loads",
  },
  "TC-AL-002": {
    section: "settings/alerts",
    spec: "00-main-ui.spec.ts",
    title: "Rules tab empty state shows No alert rules yet",
  },
  "TC-AL-010": {
    section: "settings/alerts",
    spec: "01-rules-positive.spec.ts",
    title: "Alerts page loads at /alerts",
  },
  "TC-AL-N101": {
    section: "settings/alerts",
    spec: "03-negative.spec.ts",
    title: "Create rule without name blocked",
  },

  // ── SETTINGS › Billing ─────────────────────────────────────────────────
  "TC-BL-001": {
    section: "settings/billing",
    spec: "billing.spec.ts",
    title: "Billing page loads",
  },
  "TC-BL-002": {
    section: "settings/billing",
    spec: "00-main-ui.spec.ts",
    title: "Empty state shows 0.0 total minutes",
  },
  "TC-BL-010": {
    section: "settings/billing",
    spec: "01-filters-positive.spec.ts",
    title: "Billing page loads at /billing",
  },
  "TC-BL-N101": {
    section: "settings/billing",
    spec: "03-negative.spec.ts",
    title: "Invalid billing sub-route handled gracefully",
  },

  // ── SETTINGS › Webhooks ────────────────────────────────────────────────
  "TC-IN-001": {
    section: "settings/webhooks",
    spec: "01-quick-apply-positive.spec.ts",
    title: "Webhooks page loads with quick apply controls",
  },
  "TC-WH-001": {
    section: "settings/webhooks",
    spec: "00-main-ui.spec.ts",
    title: "Webhooks heading and subtitle visible",
  },
  "TC-WH-010": {
    section: "settings/webhooks",
    spec: "01-quick-apply-positive.spec.ts",
    title: "Quick apply URL accepts HTTPS URL",
  },
  "TC-WH-020": {
    section: "settings/webhooks",
    spec: "02-subscriptions-positive.spec.ts",
    title: "Subscribe on call.triggered expands form",
  },
  "TC-WH-025": {
    section: "settings/webhooks",
    spec: "02-subscriptions-positive.spec.ts",
    title: "Custom event link reveals Custom event type section",
  },
  "TC-IN-N101": {
    section: "settings/webhooks",
    spec: "03-negative.spec.ts",
    title: "Invalid webhook URL rejected on quick apply",
  },
  "TC-WH-N109": {
    section: "settings/webhooks",
    spec: "03-negative.spec.ts",
    title: "Invalid webhooks sub-route handled gracefully",
  },
  "TC-WH-E101": {
    section: "settings/webhooks",
    spec: "04-edge.spec.ts",
    title: "Navigate away and back preserves Webhooks page",
  },

  // ── Global UI › Language switcher ──────────────────────────────────────
  "TC-LG-001": {
    section: "global/language",
    spec: "00-main-ui.spec.ts",
    title: "Language trigger visible with English EN",
  },
  "TC-LG-010": {
    section: "global/language",
    spec: "01-languages-positive.spec.ts",
    title: "Selecting Japanese updates trigger and localStorage",
  },
  "TC-LG-N101": {
    section: "global/language",
    spec: "02-search-positive.spec.ts",
    title: "Search with no match shows No results",
  },
  "TC-LG-E101": {
    section: "global/language",
    spec: "03-edge.spec.ts",
    title: "Escape key closes language panel",
  },

  // ── Global UI ──────────────────────────────────────────────────────────
  "TC-UI-001": {
    section: "global",
    spec: "responsive.spec.ts",
    title: "Responsive layout on mobile (375px)",
  },
  "TC-UI-006": {
    section: "global",
    spec: "navigation.spec.ts",
    title: "Sidebar navigation loads all dashboard routes",
  },
  "TC-UI-008": {
    section: "global",
    spec: "navigation.spec.ts",
    title: "Delete confirmation dialog",
  },
};

export function isAutomated(id: string): boolean {
  return id in AUTOMATED_CASES;
}

export function automatedIdsForSection(sectionFolder: string): Set<string> {
  return new Set(
    Object.entries(AUTOMATED_CASES)
      .filter(([, v]) => v.section === sectionFolder)
      .map(([id]) => id),
  );
}

export function automatedCount(): number {
  return Object.keys(AUTOMATED_CASES).length;
}
