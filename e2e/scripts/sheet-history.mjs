/**
 * Append-only run history for Google Sheet export (never overwrite prior runs).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { RESULT_COLUMNS, SUMMARY_TAB } from "../data/sheet-sections.mjs";
import {
  detectRunJourney,
  detectTestJourney,
  githubSpecUrl,
  hyperlinkCell,
  runSeparatorLabel,
} from "./sheet-format.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const sheetRunHistoryFile = path.join(
  root,
  "e2e/data/sheet-run-history.json",
);

export const MAX_RUN_HISTORY = Number(
  process.env.SHEET_MAX_RUN_HISTORY ?? "100",
);

export const SUMMARY_COLUMNS = [
  "Run ID",
  "Run At",
  "Journey",
  "Environment",
  "Overall Status",
  "Tests Executed",
  "Passed",
  "Failed",
  "Skipped",
  "Duration (min)",
];

export function loadSheetRunHistory() {
  if (!fs.existsSync(sheetRunHistoryFile)) {
    return { runs: [] };
  }
  return JSON.parse(fs.readFileSync(sheetRunHistoryFile, "utf8"));
}

export function saveSheetRunHistory(history) {
  fs.mkdirSync(path.dirname(sheetRunHistoryFile), { recursive: true });
  fs.writeFileSync(sheetRunHistoryFile, JSON.stringify(history, null, 2));
}

export function enrichRunEntry(entry) {
  const allRows = Object.values(entry.rowsByTab ?? {}).flat();
  const journey = entry.journey ?? detectRunJourney(allRows);
  const rowsByTab = {};
  for (const [tab, rows] of Object.entries(entry.rowsByTab ?? {})) {
    rowsByTab[tab] = rows.map((row) => ({
      ...row,
      journey: row.journey ?? detectTestJourney(row),
    }));
  }
  return { ...entry, journey, rowsByTab };
}

export function resultRowToCells(row, { withLinks = true } = {}) {
  const journey = row.journey ?? detectTestJourney(row);
  const specUrl = githubSpecUrl(row.specFile, row.line);
  const envUrl = row.environment;

  return [
    withLinks && specUrl && row.testId
      ? hyperlinkCell(specUrl, row.testId)
      : row.testId,
    withLinks && specUrl ? hyperlinkCell(specUrl, row.title) : row.title,
    journey,
    row.priority,
    row.type,
    row.tags,
    withLinks && specUrl
      ? hyperlinkCell(githubSpecUrl(row.specFile), row.specFile)
      : row.specFile,
    row.describe,
    row.status,
    row.lastRunAt,
    row.durationSec,
    row.reason,
    withLinks && envUrl ? hyperlinkCell(envUrl, envUrl) : row.environment,
    row.runId,
  ];
}

function tabStats(rows) {
  return {
    executed: rows.length,
    pass: rows.filter((r) => r.status === "Pass").length,
    fail: rows.filter((r) => r.status === "Fail").length,
    skipped: rows.filter((r) => r.status === "Skipped").length,
  };
}

function summaryStatusLabel(status) {
  if (status === "passed") return "Pass";
  if (status === "failed") return "Fail";
  if (status === "skipped") return "Skipped";
  return status ?? "";
}

/** Build sheet rows + row metadata for one section tab (newest run first, grey separator between runs). */
export function buildTabSheetRows(historyRuns, tabName) {
  const rows = [RESULT_COLUMNS];
  const rowMeta = [{ type: "header" }];
  const journeyColumnIndex = RESULT_COLUMNS.indexOf("Journey");

  let runBlockIndex = 0;
  for (const entry of historyRuns.map(enrichRunEntry)) {
    const tabRows = entry.rowsByTab?.[tabName];
    if (!tabRows?.length) continue;

    if (runBlockIndex > 0) {
      const sepRow = Array(RESULT_COLUMNS.length).fill("");
      sepRow[0] = runSeparatorLabel(entry);
      rows.push(sepRow);
      rowMeta.push({ type: "separator", runId: entry.runId, merge: true });
    }

    for (const row of tabRows) {
      rows.push(resultRowToCells(row));
      rowMeta.push({
        type: "data",
        status: row.status,
        journey: row.journey,
        journeyColumnIndex,
      });
    }
    runBlockIndex++;
  }

  return { rows, rowMeta };
}

/** Summary tab — one stats row per run, grey separator between runs. */
export function buildSummarySheetRows(historyRuns) {
  const rows = [SUMMARY_COLUMNS];
  const rowMeta = [{ type: "header" }];
  const journeyColumnIndex = SUMMARY_COLUMNS.indexOf("Journey");

  const enriched = historyRuns.map(enrichRunEntry);

  for (let i = 0; i < enriched.length; i++) {
    if (i > 0) {
      const sepRow = Array(SUMMARY_COLUMNS.length).fill("");
      sepRow[0] = runSeparatorLabel(enriched[i]);
      rows.push(sepRow);
      rowMeta.push({ type: "separator", runId: enriched[i].runId, merge: true });
    }

    const entry = enriched[i];
    const stats =
      entry.stats ?? tabStats(Object.values(entry.rowsByTab ?? {}).flat());
    rows.push([
      entry.runId,
      entry.runAt,
      entry.journey,
      hyperlinkCell(entry.environment, entry.environment),
      summaryStatusLabel(entry.status),
      stats.executed ?? entry.executed,
      stats.expected ?? stats.pass ?? 0,
      stats.unexpected ?? stats.fail ?? 0,
      stats.skipped ?? 0,
      ((entry.stats?.durationMs ?? 0) / 60000).toFixed(2),
    ]);
    rowMeta.push({
      type: "data",
      status: summaryStatusLabel(entry.status),
      journey: entry.journey,
      journeyColumnIndex,
    });
  }

  return { rows, rowMeta };
}

export function allTabNamesFromHistory(historyRuns) {
  const names = new Set();
  for (const entry of historyRuns) {
    for (const tab of Object.keys(entry.rowsByTab ?? {})) {
      names.add(tab);
    }
  }
  return [...names].sort();
}

export { SUMMARY_TAB };
