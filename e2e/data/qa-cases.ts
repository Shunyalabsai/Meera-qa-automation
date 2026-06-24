import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dashboardSectionIdForCase } from "./dashboard-sections";

const dataDir = path.dirname(fileURLToPath(import.meta.url));
const book = JSON.parse(
  fs.readFileSync(path.join(dataDir, "qa-test-cases.json"), "utf8"),
) as Record<string, Omit<QaCase, "section" | "dashboardSection">[]>;
const voiceCases = JSON.parse(
  fs.readFileSync(path.join(dataDir, "voice-call-cases.json"), "utf8"),
) as Omit<QaCase, "section" | "dashboardSection">[];

export type QaCase = {
  id: string;
  name: string;
  preconditions: string;
  steps: string;
  expected: string;
  priority: string;
  type: string;
  /** Google Sheet tab name */
  section: string;
  /** Dashboard sidebar section id */
  dashboardSection: string;
};

const SHEET_TABS = [
  ...Object.keys(book),
  "Voice Call / Telephony",
];

const voiceSection = "Voice Call / Telephony";

function enrich(row: Omit<QaCase, "section" | "dashboardSection">, sheetName: string): QaCase {
  return {
    ...row,
    section: sheetName,
    dashboardSection: dashboardSectionIdForCase(row.id, row.name),
  };
}

function casesForSheet(sheetName: string): QaCase[] {
  if (sheetName === voiceSection) {
    return voiceCases.map((c) => enrich(c, voiceSection));
  }
  const rows = book[sheetName] ?? [];
  return rows.map((c) => enrich(c, sheetName));
}

export function getAllCases(): QaCase[] {
  return SHEET_TABS.flatMap(casesForSheet);
}

export function getCasesForDashboardSection(dashboardId: string): QaCase[] {
  return getAllCases().filter((c) => c.dashboardSection === dashboardId);
}

export function getCaseById(id: string): QaCase | undefined {
  return getAllCases().find((c) => c.id === id);
}

export function caseCountByDashboardSection(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const c of getAllCases()) {
    counts[c.dashboardSection] = (counts[c.dashboardSection] ?? 0) + 1;
  }
  return counts;
}
