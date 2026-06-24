#!/usr/bin/env node
/**
 * Export ONLY tests that actually ran in the latest Playwright run → CSV per section tab.
 * Does NOT fill the sheet with catalog "Not Run" placeholders.
 *
 * Requires: test-results/sheet-results.json (written by sheet-results.reporter after `npm test`)
 * Run: npm run sheet:export
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  RESULT_COLUMNS,
  SUMMARY_TAB,
  sectionKeyFromSpecPath,
  tabNameForSection,
} from "../data/sheet-sections.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const catalogFile = path.join(root, "e2e/data/test-catalog.json");
const resultsFile = path.join(root, "test-results/sheet-results.json");
const historyFile = path.join(root, "e2e/data/test-results-history.json");
const outDir = path.join(root, "e2e/data/results-sheets");

function escapeCsv(value) {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function stripAnsi(text) {
  return String(text ?? "").replace(/\u001b\[[0-9;]*m/g, "");
}

function rowToCsv(cells) {
  return cells.map(escapeCsv).join(",");
}

function statusLabel(status) {
  if (status === "passed") return "Pass";
  if (status === "skipped") return "Skipped";
  if (status === "failed" || status === "timedOut") return "Fail";
  if (status === "interrupted") return "Interrupted";
  return status;
}

function loadJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function catalogIndex(catalog) {
  const byFileLine = new Map();
  const byTitle = new Map();
  for (const test of catalog.tests ?? []) {
    byFileLine.set(`${test.specFile}:${test.line}`, test);
    byTitle.set(`${test.specFile}::${test.rawTitle}`, test);
    byFileLine.set(`${test.specFile}:${test.line}:${test.id}`, test);
  }
  return { byFileLine, byTitle };
}

function findCatalogEntry(result, index) {
  const file = result.file.replace(/\\/g, "/");
  return (
    index.byFileLine.get(`${file}:${result.line}`) ??
    index.byTitle.get(`${file}::${result.title}`) ??
    null
  );
}

function tabForResult(result, catalogEntry) {
  if (catalogEntry?.tab) return catalogEntry.tab;
  const section = sectionKeyFromSpecPath(result.file);
  return tabNameForSection(section);
}

function dedupeRunTests(tests) {
  const byKey = new Map();
  for (const t of tests) {
    const file = t.file.replace(/\\/g, "/");
    byKey.set(`${file}:${t.line}`, t);
  }
  return [...byKey.values()];
}

/**
 * Merge this run into per-test latest store and build tab CSVs.
 * @param {{ log?: boolean, resultsFile?: string }} [options]
 * @returns {import('./export-results-sheet.mjs').ExportResult | null}
 */
export function exportSheetResults(options = {}) {
  const log = options.log ?? false;
  const resultsPath = options.resultsFile ?? resultsFile;

  if (!fs.existsSync(resultsPath)) {
    if (log) {
      console.error(
        "No real run data found at test-results/sheet-results.json",
      );
      console.error("Run tests on staging first:");
      console.error("  E2E_USE_SAVED_AUTH=true npm test");
    }
    return null;
  }

  const run = loadJson(resultsPath, null);
  if (!run?.tests?.length) {
    if (log) {
      console.error("sheet-results.json exists but contains zero test results.");
      console.error(
        "Run Playwright tests first — the sheet is not updated from catalog alone.",
      );
    }
    return null;
  }

  const catalog = loadJson(catalogFile, { tests: [], tabs: [] });
  const index = catalogIndex(catalog);
  const executed = dedupeRunTests(run.tests);

  const latestFile = path.join(root, "e2e/data/test-results-latest.json");
  const latestStore = loadJson(latestFile, { tests: {} });

  const runRows = [];

  for (const result of executed) {
    const catalogEntry = findCatalogEntry(result, index);
    const tab = tabForResult(result, catalogEntry);
    const status = statusLabel(result.status);
    const reason =
      result.status === "passed" ? "" : stripAnsi(result.reason ?? "");
    const specFile = result.file.replace(/\\/g, "/");

    const row = {
      testId: catalogEntry?.id ?? "",
      title:
        catalogEntry?.title ??
        (result.title.replace(/^TC-[A-Z0-9-]+.*?—\s*/i, "").trim() ||
          result.title),
      priority: catalogEntry?.priority ?? "",
      type: catalogEntry?.type ?? "",
      tags: catalogEntry?.tags?.join(", ") ?? "",
      specFile,
      line: result.line,
      describe: catalogEntry?.describe ?? "",
      status,
      lastRunAt: run.runAt,
      durationSec: (result.durationMs / 1000).toFixed(2),
      reason,
      environment: run.environment,
      runId: run.runId,
      tab,
    };

    const key = `${specFile}:${result.line}`;
    latestStore.tests[key] = row;
    runRows.push(row);
  }

  fs.writeFileSync(latestFile, JSON.stringify(latestStore, null, 2));

  const allLatest = Object.values(latestStore.tests);
  const mergedByTab = {};
  for (const row of allLatest) {
    if (!mergedByTab[row.tab]) mergedByTab[row.tab] = [];
    mergedByTab[row.tab].push(row);
  }

  // Append run to history (executed tests only)
  const history = loadJson(historyFile, { runs: [] });
  history.runs.unshift({
    runId: run.runId,
    runAt: run.runAt,
    finishedAt: run.finishedAt,
    environment: run.environment,
    status: run.status,
    stats: run.stats,
    executed: executed.length,
    tabSummary: Object.fromEntries(
      Object.entries(
        runRows.reduce((acc, row) => {
          if (!acc[row.tab]) acc[row.tab] = [];
          acc[row.tab].push(row);
          return acc;
        }, {}),
      ).map(([tab, rows]) => [
        tab,
        {
          executed: rows.length,
          pass: rows.filter((r) => r.status === "Pass").length,
          fail: rows.filter((r) => r.status === "Fail").length,
          skipped: rows.filter((r) => r.status === "Skipped").length,
        },
      ]),
    ),
  });
  history.runs = history.runs.slice(0, 50);
  fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));

  fs.mkdirSync(outDir, { recursive: true });

  for (const file of fs.readdirSync(outDir)) {
    if (file.endsWith(".csv")) {
      fs.unlinkSync(path.join(outDir, file));
    }
  }

  for (const [tab, rows] of Object.entries(mergedByTab)) {
    const lines = [rowToCsv(RESULT_COLUMNS)];
    for (const r of rows) {
      lines.push(
        rowToCsv([
          r.testId,
          r.title,
          r.priority,
          r.type,
          r.tags,
          r.specFile,
          r.describe,
          r.status,
          r.lastRunAt,
          r.durationSec,
          r.reason,
          r.environment,
          r.runId,
        ]),
      );
    }
    const safeName = tab.replace(/[\\/:*?"<>|]/g, "-");
    fs.writeFileSync(path.join(outDir, `${safeName}.csv`), lines.join("\n") + "\n");
  }

  const pass = runRows.filter((r) => r.status === "Pass").length;
  const fail = runRows.filter((r) => r.status === "Fail").length;
  const skipped = runRows.filter((r) => r.status === "Skipped").length;

  const summaryLines = [
    rowToCsv([
      "Run ID",
      "Run At",
      "Environment",
      "Overall Status",
      "Tests Executed",
      "Passed",
      "Failed",
      "Skipped",
      "Duration (min)",
    ]),
    rowToCsv([
      run.runId,
      run.runAt,
      run.environment,
      run.status,
      runRows.length,
      pass,
      fail,
      skipped,
      (run.stats.durationMs / 60000).toFixed(2),
    ]),
    "",
    rowToCsv(["Section Tab", "Executed", "Pass", "Fail", "Skipped"]),
  ];

  for (const tab of Object.keys(mergedByTab).sort()) {
    const rows = mergedByTab[tab];
    summaryLines.push(
      rowToCsv([
        tab,
        rows.length,
        rows.filter((r) => r.status === "Pass").length,
        rows.filter((r) => r.status === "Fail").length,
        rows.filter((r) => r.status === "Skipped").length,
      ]),
    );
  }

  fs.writeFileSync(
    path.join(outDir, `${SUMMARY_TAB.replace(/[\\/:*?"<>|]/g, "-")}.csv`),
    summaryLines.join("\n") + "\n",
  );

  const mergedOut = path.join(root, "e2e/data/test-results-merged.json");
  const mergedPayload = {
    generatedAt: new Date().toISOString(),
    run,
    runSummary: {
      executed: runRows.length,
      pass,
      fail,
      skipped,
    },
    tabs: mergedByTab,
    summary: {
      executed: allLatest.length,
      pass: allLatest.filter((r) => r.status === "Pass").length,
      fail: allLatest.filter((r) => r.status === "Fail").length,
      skipped: allLatest.filter((r) => r.status === "Skipped").length,
    },
  };
  fs.writeFileSync(mergedOut, JSON.stringify(mergedPayload, null, 2));

  if (log) {
    console.log(
      `Exported ${Object.keys(mergedByTab).length} section tab(s) + Summary → ${outDir}`,
    );
    console.log(`  Run: ${run.runId} (${run.status})`);
    console.log(`  Environment: ${run.environment}`);
    console.log(
      `  This run: ${runRows.length} — Pass ${pass} / Fail ${fail} / Skipped ${skipped}`,
    );
    console.log(
      `  Latest store: ${allLatest.length} test(s) across ${Object.keys(mergedByTab).length} tab(s)`,
    );
  }

  return mergedPayload;
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) ===
    path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  const result = exportSheetResults({ log: true });
  if (!result) process.exit(1);
}
