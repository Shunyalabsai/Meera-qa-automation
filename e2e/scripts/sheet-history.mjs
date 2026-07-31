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
  "Run At",
  "Overall Status",
  "Journey",
  "Executed",
  "Passed",
  "Failed",
  "Skipped",
  "Pass %",
  "Duration (min)",
];

/** Fixed column count for the Summary tab layout (sections + key-value rows). */
export const SUMMARY_WIDTH = RESULT_COLUMNS.length;

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

/** Capitalize priority "high" → "High" for readability. */
function friendlyPriority(priority) {
  const p = String(priority ?? "").trim();
  if (!p) return "";
  return p.charAt(0).toUpperCase() + p.slice(1);
}

export function resultRowToCells(row, { withLinks = true } = {}) {
  const specUrl = githubSpecUrl(row.specFile, row.line);
  const screenshot = row.screenshot ?? "";

  return [
    withLinks && specUrl && row.testId
      ? hyperlinkCell(specUrl, row.testId)
      : row.testId,
    withLinks && specUrl ? hyperlinkCell(specUrl, row.title) : row.title,
    row.module ?? "",
    friendlyPriority(row.priority),
    row.status,
    row.steps ?? "",
    row.expected ?? "",
    row.friendlyReason ?? "",
    row.techReason ?? "",
    screenshot,
    row.durationSec ?? "",
    withLinks && specUrl
      ? hyperlinkCell(githubSpecUrl(row.specFile), row.specFile)
      : row.specFile,
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

export function summaryStatusLabel(status) {
  if (status === "passed") return "Pass";
  if (status === "failed") return "Fail";
  if (status === "skipped") return "Skipped";
  return status ?? "";
}

/** Build sheet rows + row metadata for one section tab — latest run only (clean, no stale blocks). */
export function buildTabSheetRows(historyRuns, tabName) {
  const rows = [RESULT_COLUMNS];
  const rowMeta = [{ type: "header" }];

  for (const entry of historyRuns.map(enrichRunEntry)) {
    const tabRows = entry.rowsByTab?.[tabName];
    if (!tabRows?.length) continue;

    for (const row of tabRows) {
      rows.push(resultRowToCells(row));
      rowMeta.push({ type: "data", status: row.status });
    }
    break; // newest run with rows for this tab only
  }

  return { rows, rowMeta };
}

function emptyRow() {
  return Array(SUMMARY_WIDTH).fill("");
}

/** Pass/Fail/Skip counts for the module column of the latest run's rows. */
function moduleBreakdown(rows) {
  const byModule = new Map();
  for (const row of rows) {
    const mod = row.module || "Uncategorised";
    if (!byModule.has(mod)) byModule.set(mod, { pass: 0, fail: 0, skipped: 0 });
    const bucket = byModule.get(mod);
    if (row.status === "Pass") bucket.pass++;
    else if (row.status === "Fail") bucket.fail++;
    else if (row.status === "Skipped") bucket.skipped++;
  }
  return [...byModule.entries()].sort((a, b) => {
    const tot = (r) => r[1].pass + r[1].fail + r[1].skipped;
    return tot(b) - tot(a);
  });
}

/** Group identical plain-English failure reasons, most frequent first. */
function topFailureReasons(rows, limit = 8) {
  const byReason = new Map();
  for (const row of rows) {
    if (row.status !== "Fail" || !row.friendlyReason) continue;
    const reason = row.friendlyReason;
    byReason.set(reason, (byReason.get(reason) ?? 0) + 1);
  }
  return [...byReason.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
}

/**
 * Summary tab — plain-language dashboard:
 *  1. Latest run overview (key-value)
 *  2. Module breakdown (latest run)
 *  3. Most common failure reasons (latest run)
 *  4. Run history (one row per stored run)
 */
export function buildSummarySheetRows(historyRuns) {
  const rows = [];
  const rowMeta = [];
  const enriched = historyRuns.map(enrichRunEntry);
  const latest = enriched[0];

  // Title
  const titleRow = emptyRow();
  titleRow[0] = "MEERA VAP — AUTOMATED TEST REPORT";
  rows.push(titleRow);
  rowMeta.push({ type: "title", merge: true });
  rows.push(emptyRow());
  rowMeta.push({ type: "spacer" });

  // 1. Latest run overview
  if (latest) {
    const stats =
      latest.stats ?? tabStats(Object.values(latest.rowsByTab ?? {}).flat());
    const pass = stats.expected ?? stats.pass ?? 0;
    const fail = stats.unexpected ?? stats.fail ?? 0;
    const skip = stats.skipped ?? 0;
    const total = pass + fail + skip;
    const passRate = total ? Math.round((pass / total) * 100) : 0;
    const status = summaryStatusLabel(latest.status);

    const section = emptyRow();
    section[0] = "LATEST RUN — OVERVIEW";
    rows.push(section);
    rowMeta.push({ type: "section", merge: true });

    const kvPairs = [
      ["Run date", latest.runAt],
      ["Environment", latest.environment],
      ["Overall status", status],
      ["Tests executed", String(total)],
      ["Passed", String(pass)],
      ["Failed", String(fail)],
      ["Skipped", String(skip)],
      ["Pass rate", `${passRate}%`],
      ["Duration", `${((stats.durationMs ?? 0) / 60000).toFixed(1)} min`],
    ];
    for (const [label, value] of kvPairs) {
      const r = emptyRow();
      r[0] = label;
      r[1] =
        label === "Environment" ? hyperlinkCell(value, value) : String(value);
      rows.push(r);
      rowMeta.push({ type: "kv", label });
    }
    rows.push(emptyRow());
    rowMeta.push({ type: "spacer" });

    // 2. Module breakdown
    const breakdown = moduleBreakdown(
      Object.values(latest.rowsByTab ?? {}).flat(),
    );
    if (breakdown.length) {
      const modSection = emptyRow();
      modSection[0] = "MODULE BREAKDOWN — LATEST RUN";
      rows.push(modSection);
      rowMeta.push({ type: "section", merge: true });

      const modHeader = emptyRow();
      modHeader[0] = "Module";
      modHeader[1] = "Passed";
      modHeader[2] = "Failed";
      modHeader[3] = "Skipped";
      modHeader[4] = "Total";
      modHeader[5] = "Pass rate";
      rows.push(modHeader);
      rowMeta.push({ type: "header" });

      for (const [mod, counts] of breakdown) {
        const tot = counts.pass + counts.fail + counts.skipped;
        const r = emptyRow();
        r[0] = mod;
        r[1] = String(counts.pass);
        r[2] = String(counts.fail);
        r[3] = String(counts.skipped);
        r[4] = String(tot);
        r[5] = tot ? `${Math.round((counts.pass / tot) * 100)}%` : "—";
        rows.push(r);
        rowMeta.push({ type: "data", status: counts.fail ? "Fail" : counts.skipped ? "Skipped" : "Pass" });
      }
      rows.push(emptyRow());
      rowMeta.push({ type: "spacer" });
    }

    // 3. Top failure reasons
    const reasons = topFailureReasons(
      Object.values(latest.rowsByTab ?? {}).flat(),
    );
    if (reasons.length) {
      const reasonSection = emptyRow();
      reasonSection[0] = "MOST COMMON FAILURE REASONS — LATEST RUN";
      rows.push(reasonSection);
      rowMeta.push({ type: "section", merge: true });

      const reasonHeader = emptyRow();
      reasonHeader[0] = "Count";
      reasonHeader[1] = "Plain-English reason";
      rows.push(reasonHeader);
      rowMeta.push({ type: "header" });

      for (const [reason, count] of reasons) {
        const r = emptyRow();
        r[0] = String(count);
        r[1] = reason;
        rows.push(r);
        rowMeta.push({ type: "data" });
      }
      rows.push(emptyRow());
      rowMeta.push({ type: "spacer" });
    }
  }

  // 4. Run history
  if (enriched.length) {
    const histSection = emptyRow();
    histSection[0] = "RUN HISTORY";
    rows.push(histSection);
    rowMeta.push({ type: "section", merge: true });

    const histHeader = emptyRow();
    SUMMARY_COLUMNS.forEach((c, i) => {
      histHeader[i] = c;
    });
    rows.push(histHeader);
    rowMeta.push({ type: "header" });

    for (const entry of enriched) {
      const stats =
        entry.stats ?? tabStats(Object.values(entry.rowsByTab ?? {}).flat());
      const pass = stats.expected ?? stats.pass ?? 0;
      const fail = stats.unexpected ?? stats.fail ?? 0;
      const skip = stats.skipped ?? 0;
      const total = pass + fail + skip;
      const status = summaryStatusLabel(entry.status);
      const r = emptyRow();
      r[0] = entry.runAt;
      r[1] = status;
      r[2] = entry.journey ?? "";
      r[3] = String(stats.executed ?? total);
      r[4] = String(pass);
      r[5] = String(fail);
      r[6] = String(skip);
      r[7] = total ? `${Math.round((pass / total) * 100)}%` : "—";
      r[8] = ((entry.stats?.durationMs ?? 0) / 60000).toFixed(1);
      rows.push(r);
      rowMeta.push({ type: "data", status });
    }
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
