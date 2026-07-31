/**
 * Registry of known product gaps, staging quirks, and untestable UI cases.
 *
 * Every skip that is NOT env/manual MUST reference an id here.
 * Run: npm run issues:audit
 *
 * Categories:
 * - product-gap    → app bug or missing validation on staging (test should FAIL until fixed)
 * - staging-infra  → deployment/nginx quirk; tests adapt navigation only
 * - untestable-ui  → scenario impossible via real UI; do not DOM-hack to force it
 * - env-precondition → workspace data state (empty list, no telephony accounts)
 */

/** @type {Record<string, { category: string; summary: string; status: string; alternative?: string; ticket?: string; fix?: string }>} */
export const KNOWN_ISSUES = {
  "IS-N102": {
    category: "untestable-ui",
    summary:
      "Native type=date inputs reject non-ISO text in the browser — invalid free-text dates are not user-reachable",
    status: "wont-fix-test",
    alternative: "TC-IS-N101 (reversed range), TC-IS-N104 (future range)",
  },
  "PT-N107": {
    category: "product-gap",
    summary: "Prompt template create accepts duplicate expected-variable field names",
    status: "open",
    fix: "Block submit and show duplicate-field validation",
  },
  "CM-LINK-001": {
    category: "product-gap",
    summary:
      'Campaign create form "Add one in Phone Numbers" link href omits /vap/ — click lands on nginx 404 (https://agents.shunyalabs.ai/phone-numbers)',
    status: "open",
    fix: "Link href should be /vap/phone-numbers (or relative under SPA base)",
    tests: ["TC-CM-020", "TC-CM-021", "CTA-CM-002"],
    note:
      "Earlier test runs showed false Pass when clickAddPhoneNumbersLink() fell back to sidebar nav — removed; tests must fail until product fix",
  },
  "CL-EXPORT-001": {
    category: "product-gap",
    summary:
      "Calls list exposes no Export / Download / CSV control even when call records are present",
    status: "open",
    fix: "Add export action to the Calls page toolbar",
  },
  "AG-102": {
    category: "product-gap",
    summary:
      "Staging accepts whitespace-only agent names — trim validation not enforced server-side (edge-cases NAME-SPACE skips until fixed)",
    status: "open",
    fix: "Trim agent name before submit and block whitespace-only values",
  },
};

/** Documented staging infrastructure — tests may adapt; not product bugs. */
export const STAGING_INFRA = {
  "SPA-RELOAD": {
    category: "staging-infra",
    summary:
      "Staging nginx has no SPA fallback on deep-link reload — use gotoApp() + sidebar or reloadSpaRoute()",
    status: "documented",
    fix: "e2e/helpers/navigate.ts",
  },
  "SPA-DEEPLINK": {
    category: "staging-infra",
    summary:
      "Direct deep links to /vap/<route> may 404 — open SPA root then sidebar-navigate",
    status: "documented",
    fix: "e2e/helpers/navigate.ts gotoApp()",
  },
};

export const ISSUE_CATEGORIES = [
  "product-gap",
  "staging-infra",
  "untestable-ui",
  "env-precondition",
  "manual",
];
