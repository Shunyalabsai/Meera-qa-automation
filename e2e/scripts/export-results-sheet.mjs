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
import {
  MAX_RUN_HISTORY,
  allTabNamesFromHistory,
  buildSummarySheetRows,
  buildTabSheetRows,
  loadSheetRunHistory,
  saveSheetRunHistory,
} from "./sheet-history.mjs";
import {
  cleanTechnicalError,
  detectRunJourney,
  detectTestJourney,
  friendlyExpected,
  friendlyFailureReason,
  friendlyModule,
  friendlyPreconditions,
  friendlyStepsForTest,
} from "./sheet-format.mjs";
import { MANUAL_TEST_CASES } from "../data/manual-test-cases.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const catalogFile = path.join(root, "e2e/data/test-catalog.json");
const resultsFile = path.join(root, "test-results/sheet-results.json");
const playwrightJsonFile = path.join(root, "test-results/results.json");
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

/** Last retry wins — one row per test (keyed by title for dynamic specs). */
function dedupeRunTests(tests) {
  const byKey = new Map();
  for (const t of tests) {
    const file = t.file.replace(/\\/g, "/");
    byKey.set(`${file}:${t.line}:${t.title}`, t);
  }
  return [...byKey.values()];
}

function specFilePath(specFile) {
  const normalized = specFile.replace(/\\/g, "/");
  return normalized.startsWith("e2e/") ? normalized : `e2e/${normalized}`;
}

function flattenPlaywrightJson(report) {
  const tests = [];

  function walkSuite(suite) {
    for (const spec of suite.specs ?? []) {
      for (const test of spec.tests ?? []) {
        const results = test.results ?? [];
        const result = results[results.length - 1];
        if (!result) continue;

        let reason = "";
        if (result.status === "failed" || result.status === "timedOut") {
          reason =
            result.errors?.map((e) => e.message).join(" ") ?? "Test failed";
        } else if (result.status === "skipped") {
          reason =
            result.error?.message ??
            test.annotations?.find((a) => a.type === "skip")?.description ??
            "Skipped";
        } else if (result.status === "interrupted") {
          reason = result.error?.message ?? "Interrupted";
        }

        const screenshot =
          result.attachments?.find(
            (a) => a.contentType === "image/png" && a.path,
          )?.path ?? undefined;

        tests.push({
          title: spec.title,
          file: specFilePath(spec.file),
          line: spec.line,
          status: result.status,
          reason: stripAnsi(reason).replace(/\s+/g, " ").trim().slice(0, 4000),
          durationMs: result.duration,
          retry: result.retry,
          screenshot,
        });
      }
    }
    for (const child of suite.suites ?? []) walkSuite(child);
  }

  for (const suite of report.suites ?? []) walkSuite(suite);
  return dedupeRunTests(tests);
}

/** Prefer Playwright results.json — complete; sheet-results.json can drop dynamic tests. */
function loadRunPayload() {
  const sheetRun = fs.existsSync(resultsFile)
    ? loadJson(resultsFile, null)
    : null;
  const pwReport = fs.existsSync(playwrightJsonFile)
    ? loadJson(playwrightJsonFile, null)
    : null;

  if (!sheetRun?.tests?.length && !pwReport) return null;

  const pwTests = pwReport ? flattenPlaywrightJson(pwReport) : [];
  const sheetTests = sheetRun?.tests?.length
    ? dedupeRunTests(sheetRun.tests)
    : [];

  const usePlaywright =
    pwTests.length > sheetTests.length ||
    (pwTests.length > 0 && sheetTests.length === 0);

  const tests = usePlaywright ? pwTests : sheetTests;
  if (!tests.length) return null;

  const pwStats = pwReport?.stats;
  const passed = tests.filter((t) => t.status === "passed").length;
  const failed = tests.filter((t) =>
    ["failed", "timedOut", "interrupted"].includes(t.status),
  ).length;
  const skipped = tests.filter((t) => t.status === "skipped").length;
  const flaky = tests.filter((t) => t.retry > 0 && t.status === "passed").length;

  const runAt =
    sheetRun?.runAt ?? pwStats?.startTime ?? new Date().toISOString();
  const runId = sheetRun?.runId ?? runAt.replace(/[:.]/g, "-");

  return {
    runAt,
    finishedAt: sheetRun?.finishedAt ?? new Date().toISOString(),
    environment: sheetRun?.environment ?? process.env.PLAYWRIGHT_BASE_URL ?? "",
    runId,
    status:
      sheetRun?.status ??
      (failed > 0 ? "failed" : skipped === tests.length ? "skipped" : "passed"),
    stats: {
      expected: passed,
      unexpected: failed,
      skipped,
      flaky,
      durationMs: pwStats?.duration ?? sheetRun?.stats?.durationMs ?? 0,
    },
    tests,
    source: usePlaywright ? "results.json" : "sheet-results.json",
  };
}

/**
 * Merge this run into per-test latest store and build tab CSVs.
 * @param {{ log?: boolean, resultsFile?: string }} [options]
 * @returns {import('./export-results-sheet.mjs').ExportResult | null}
 */
export function exportSheetResults(options = {}) {
  const log = options.log ?? false;

  const run = loadRunPayload();
  if (!run?.tests?.length) {
    if (log) {
      console.error(
        "No real run data found at test-results/sheet-results.json or test-results/results.json",
      );
      console.error("Run tests on staging first:");
      console.error("  E2E_USE_SAVED_AUTH=true npm test");
    }
    return null;
  }

  if (log && run.source) {
    console.log(`  Source: ${run.source} (${run.tests.length} tests)`);
  }

  const catalog = loadJson(catalogFile, { tests: [], tabs: [] });
  const index = catalogIndex(catalog);
  const executed = dedupeRunTests(run.tests);

  const runRows = [];

  for (const result of executed) {
    const catalogEntry = findCatalogEntry(result, index);
    const tab = tabForResult(result, catalogEntry);
    const status = statusLabel(result.status);
    const reason =
      result.status === "passed" ? "" : stripAnsi(result.reason ?? "");
    const specFile = result.file.replace(/\\/g, "/");
    const rawReason = result.reason ?? "";

    const testId =
      catalogEntry?.id ??
      result.title.match(/^(TC-[A-Z0-9-]+)/)?.[1] ??
      "";
    const title =
      catalogEntry?.title ??
      (result.title.replace(/^TC-[A-Z0-9-]+.*?—\s*/i, "").trim() ||
        result.title);
    const describe = catalogEntry?.describe ?? "";
    // Fall back to the spec's section when the catalog has no entry (e.g. dynamic tests).
    const sectionKey =
      catalogEntry?.sectionKey ?? sectionKeyFromSpecPath(specFile);
    const module = friendlyModule(describe, sectionKey);
    const manual = testId ? MANUAL_TEST_CASES[testId] ?? null : null;
    const failed = status !== "Pass";

    const row = {
      testId,
      title,
      rawTitle: result.title,
      priority: catalogEntry?.priority ?? "",
      type: catalogEntry?.type ?? "",
      tags: catalogEntry?.tags?.join(", ") ?? "",
      specFile,
      line: result.line,
      describe,
      sectionKey,
      module,
      preconditions: friendlyPreconditions({ manual }),
      steps: friendlyStepsForTest({
        manual,
        title,
        module,
        specFile,
        line: result.line,
      }),
      expected: friendlyExpected({ manual, title, status }),
      friendlyReason: failed
        ? friendlyFailureReason(rawReason || reason, result.status)
        : "",
      techReason: failed ? cleanTechnicalError(rawReason || reason) : "",
      screenshot: result.screenshot ?? "",
      status,
      lastRunAt: run.runAt,
      durationSec: (result.durationMs / 1000).toFixed(2),
      reason,
      environment: run.environment,
      runId: run.runId,
      tab,
      journey: detectTestJourney({
        tags: catalogEntry?.tags?.join(", ") ?? "",
        describe,
        specFile,
        rawTitle: result.title,
      }),
    };

    runRows.push(row);
  }

  const rowsByTab = {};
  for (const row of runRows) {
    if (!rowsByTab[row.tab]) rowsByTab[row.tab] = [];
    rowsByTab[row.tab].push(row);
  }

  const sheetHistory = loadSheetRunHistory();

  // One-time seed from legacy merged file (single run) when history is empty
  if (!sheetHistory.runs.length) {
    const legacyMerged = path.join(root, "e2e/data/test-results-merged.json");
    if (fs.existsSync(legacyMerged)) {
      const legacy = loadJson(legacyMerged, null);
      if (legacy?.run && legacy?.tabs && Object.keys(legacy.tabs).length) {
        sheetHistory.runs.unshift({
          runId: legacy.run.runId,
          runAt: legacy.run.runAt,
          finishedAt: legacy.run.finishedAt,
          environment: legacy.run.environment,
          status: legacy.run.status,
          stats: legacy.run.stats,
          executed: legacy.runSummary?.executed ?? legacy.summary?.executed,
          rowsByTab: legacy.tabs,
        });
        saveSheetRunHistory(sheetHistory);
        if (log) {
          console.log(
            `  Seeded sheet history from previous merged export (${legacy.run.runId})`,
          );
        }
      }
    }
  }

  const alreadyRecorded = sheetHistory.runs.some((r) => r.runId === run.runId);

  const runJourney = detectRunJourney(runRows);

  if (!alreadyRecorded) {
    sheetHistory.runs.unshift({
      runId: run.runId,
      runAt: run.runAt,
      finishedAt: run.finishedAt,
      environment: run.environment,
      status: run.status,
      stats: run.stats,
      executed: executed.length,
      journey: runJourney,
      rowsByTab,
    });
    sheetHistory.runs = sheetHistory.runs.slice(0, MAX_RUN_HISTORY);
    saveSheetRunHistory(sheetHistory);
    if (log) {
      console.log(
        `  Appended run to sheet history (${sheetHistory.runs.length} run(s) stored)`,
      );
    }
  } else if (log) {
    console.log(`  Run ${run.runId} already in sheet history — rebuilding sheet`);
  }

  // Lightweight metadata log (no per-test rows)
  const metaHistory = loadJson(historyFile, { runs: [] });
  if (!metaHistory.runs.some((r) => r.runId === run.runId)) {
    metaHistory.runs.unshift({
      runId: run.runId,
      runAt: run.runAt,
      finishedAt: run.finishedAt,
      environment: run.environment,
      status: run.status,
      stats: run.stats,
      executed: executed.length,
      tabSummary: Object.fromEntries(
        Object.entries(rowsByTab).map(([tab, rows]) => [
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
    metaHistory.runs = metaHistory.runs.slice(0, 50);
    fs.writeFileSync(historyFile, JSON.stringify(metaHistory, null, 2));
  }

  const tabNames = allTabNamesFromHistory(sheetHistory.runs);

  fs.mkdirSync(outDir, { recursive: true });

  for (const file of fs.readdirSync(outDir)) {
    if (file.endsWith(".csv")) {
      fs.unlinkSync(path.join(outDir, file));
    }
  }

  const sheetTabs = {};
  const sheetTabMeta = {};
  for (const tab of tabNames) {
    const built = buildTabSheetRows(sheetHistory.runs, tab);
    sheetTabs[tab] = built.rows;
    sheetTabMeta[tab] = built.rowMeta;
    const safeName = tab.replace(/[\\/:*?"<>|]/g, "-");
    const lines = built.rows.map((cells) => rowToCsv(cells));
    fs.writeFileSync(path.join(outDir, `${safeName}.csv`), lines.join("\n") + "\n");
  }

  const summaryBuilt = buildSummarySheetRows(sheetHistory.runs);
  const summarySheetRows = summaryBuilt.rows;
  const summarySheetMeta = summaryBuilt.rowMeta;
  fs.writeFileSync(
    path.join(outDir, `${SUMMARY_TAB.replace(/[\\/:*?"<>|]/g, "-")}.csv`),
    summarySheetRows.map((cells) => rowToCsv(cells)).join("\n") + "\n",
  );

  const pass = runRows.filter((r) => r.status === "Pass").length;
  const fail = runRows.filter((r) => r.status === "Fail").length;
  const skipped = runRows.filter((r) => r.status === "Skipped").length;

  const mergedOut = path.join(root, "e2e/data/test-results-merged.json");
  const mergedPayload = {
    generatedAt: new Date().toISOString(),
    run: { ...run, journey: runJourney },
    historyRunCount: sheetHistory.runs.length,
    runSummary: {
      executed: runRows.length,
      pass,
      fail,
      skipped,
      journey: runJourney,
    },
    sheetTabs,
    sheetTabMeta,
    summarySheetRows,
    summarySheetMeta,
    tabNames,
  };
  fs.writeFileSync(mergedOut, JSON.stringify(mergedPayload, null, 2));

  if (log) {
    console.log(
      `Exported ${tabNames.length} section tab(s) + Summary → ${outDir}`,
    );
    console.log(`  Run: ${run.runId} (${run.status}) — ${runJourney}`);
    console.log(`  Environment: ${run.environment}`);
    console.log(
      `  This run: ${runRows.length} — Pass ${pass} / Fail ${fail} / Skipped ${skipped}`,
    );
    console.log(
      `  Sheet history: ${sheetHistory.runs.length} run(s) — Summary tab tracks runs; section tabs list all test rows`,
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
