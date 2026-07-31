/**
 * Google Sheet tab names — one tab per dashboard section.
 * Used by catalog scan, CSV export, and Sheets publish scripts.
 */
export const RESULTS_SHEET_ID =
  process.env.GOOGLE_RESULTS_SHEET_ID ??
  "1MgzIeVQOLdquLraUnPH33vm-MvWBcijYmIZerHMG7Ro";

export const SUMMARY_TAB = "Summary";

/** @type {Record<string, string>} top-level dashboard group → sheet tab title */
export const SECTION_TAB_NAMES = {
  authentication: "Authentication",
  build: "BUILD",
  run: "RUN",
  analyze: "ANALYZE",
  settings: "SETTINGS",
  global: "Global UI",
  workspace: "Workspace",
  qa: "QA Registry",
};

/**
 * Readable report columns — plain-language first, engineer details at the end.
 * "Failure reason" is a human sentence; "Error detail" keeps the raw error.
 * Matches the manual QA sheet's structure: Preconditions + bulleted Test Steps.
 * Screenshot is the 11th column (0-based index 10).
 */
export const RESULT_COLUMNS = [
  "Test ID",
  "Test Case",
  "Module",
  "Priority",
  "Status",
  "Preconditions",
  "How to test",
  "Expected result",
  "Failure reason",
  "Error detail",
  "Screenshot",
  "Duration (s)",
  "Spec file",
];

/**
 * @param {string} specRelPath e.g. e2e/tests/suite/build/agents/foo.spec.ts
 */
export function sectionKeyFromSpecPath(specRelPath) {
  const normalized = specRelPath.replace(/\\/g, "/");
  const m = normalized.match(/tests\/suite\/(.+\.spec\.ts)$/);
  if (!m) return "qa";

  const dir = m[1].replace(/\/[^/]+\.spec\.ts$/, "");
  const parts = dir.split("/");

  if (parts[0] === "build") return "build";
  if (parts[0] === "run") return "run";
  if (parts[0] === "analyze") return "analyze";
  if (parts[0] === "settings") return "settings";

  return parts[0] ?? "qa";
}

/** @param {string} sectionKey */
export function tabNameForSection(sectionKey) {
  return SECTION_TAB_NAMES[sectionKey] ?? sectionKey;
}
