#!/usr/bin/env node
/**
 * Build a standalone HTML test dashboard from the latest run + run history.
 *
 * Self-contained single file:
 *  - KPI cards (executed / passed / failed / skipped / pass rate / duration)
 *  - Pass-rate trend over all stored runs (Chart.js line)
 *  - Pass / Fail / Skipped per run (stacked bars)
 *  - Latest run result (donut) + module breakdown (stacked bars) + top failure reasons
 *  - Failure cards with INLINE screenshots (base64-embedded, no Drive needed)
 *  - Searchable table of every test in the latest run
 *
 * Charts use Chart.js loaded from a CDN; if it is unreachable the tables and
 * cards still render (charts show a short notice).
 *
 * Run: npm run sheet:dashboard   (also regenerated automatically after every export)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const mergedFile = path.join(root, "e2e/data/test-results-merged.json");
const historyFile = path.join(root, "e2e/data/sheet-run-history.json");
const outFile = path.join(root, "e2e/data/results-sheets/dashboard.html");

function loadJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

/** Compact label for chart axes, e.g. "Jul 31 15:41". */
function shortDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function toBase64Png(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return "";
  try {
    const buf = fs.readFileSync(filePath);
    if (buf.length > 2.5 * 1024 * 1024) return ""; // keep the file reasonable
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return "";
  }
}

function statusLabel(s) {
  if (s === "passed") return "Pass";
  if (s === "failed") return "Fail";
  if (s === "skipped") return "Skipped";
  return String(s ?? "");
}

function moduleBreakdown(rows) {
  const by = new Map();
  for (const row of rows) {
    const mod = row.module || "Uncategorised";
    if (!by.has(mod)) by.set(mod, { passed: 0, failed: 0, skipped: 0 });
    const b = by.get(mod);
    if (row.status === "Pass") b.passed++;
    else if (row.status === "Fail" || row.status === "Interrupted") b.failed++;
    else if (row.status === "Skipped") b.skipped++;
  }
  return [...by.entries()]
    .map(([module, counts]) => ({ module, ...counts }))
    .sort(
      (a, b) =>
        b.passed + b.failed + b.skipped - (a.passed + a.failed + a.skipped),
    );
}

function topFailureReasons(rows, limit = 8) {
  const by = new Map();
  for (const row of rows) {
    if (row.status !== "Fail" && row.status !== "Interrupted") continue;
    if (!row.friendlyReason) continue;
    by.set(row.friendlyReason, (by.get(row.friendlyReason) ?? 0) + 1);
  }
  return [...by.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
}

function buildDashboardData() {
  const merged = loadJson(mergedFile, null);
  const history = loadJson(historyFile, { runs: [] });
  if (!merged) {
    console.error("Missing merged results. Run tests first (npm run sheet:update).");
    process.exit(1);
  }

  const run = merged.run ?? {};
  const summary = merged.runSummary ?? {};

  // Enriched rows for the latest run come from the stored history entry.
  const latestRows = history.runs?.[0]?.rowsByTab
    ? Object.values(history.runs[0].rowsByTab).flat()
    : [];

  const runs = history.runs ?? [];
  const trendRuns = [...runs].reverse(); // chronological for charts

  const trend = trendRuns.map((r) => {
    const st = r.stats ?? {};
    const passed = st.expected ?? st.pass ?? 0;
    const failed = st.unexpected ?? st.fail ?? 0;
    const skipped = st.skipped ?? 0;
    const total = passed + failed + skipped;
    return {
      label: shortDate(r.runAt),
      passRate: total ? Math.round((passed / total) * 100) : 0,
      passed,
      failed,
      skipped,
    };
  });

  const failures = latestRows
    .filter((r) => r.status === "Fail" || r.status === "Interrupted")
    .map((r) => ({
      testId: r.testId,
      title: r.title,
      module: r.module,
      priority: r.priority,
      friendlyReason: r.friendlyReason,
      techReason: r.techReason,
      steps: r.steps,
      expected: r.expected,
      screenshot: toBase64Png(r.screenshot),
      specFile: r.specFile,
      line: r.line,
      durationSec: r.durationSec,
    }));

  const allTests = latestRows.map((r) => ({
    testId: r.testId,
    title: r.title,
    module: r.module,
    priority: r.priority,
    status: r.status,
    durationSec: r.durationSec,
    specFile: r.specFile,
    line: r.line,
  }));

  return {
    generatedAt: new Date().toISOString(),
    run: {
      runAt: run.runAt,
      environment: run.environment,
      status: statusLabel(run.status),
      journey: run.journey ?? summary.journey ?? "",
      runId: run.runId,
    },
    summary: {
      executed: summary.executed ?? allTests.length,
      passed: summary.pass ?? 0,
      failed: summary.fail ?? 0,
      skipped: summary.skipped ?? 0,
      passRate: (() => {
        const t = (summary.pass ?? 0) + (summary.fail ?? 0) + (summary.skipped ?? 0);
        return t ? Math.round(((summary.pass ?? 0) / t) * 100) : 0;
      })(),
      durationMin: ((run.stats?.durationMs ?? 0) / 60000).toFixed(1),
      historyRunCount: runs.length,
    },
    trend,
    modules: moduleBreakdown(latestRows),
    topReasons: topFailureReasons(latestRows),
    failures,
    allTests,
  };
}

function renderHtml(data) {
  const { run, summary, trend, modules, topReasons, failures, allTests } = data;
  const noRuns = allTests.length === 0;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Meera VAP — Test Dashboard</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js"></script>
<style>
:root{
  --pass:#2e7d32; --fail:#c62828; --skip:#b8860b;
  --pass-bg:#e8f5e9; --fail-bg:#ffebee; --skip-bg:#fff8e1;
  --ink:#1b2430; --muted:#64748b; --card:#fff; --bg:#f3f5f9; --line:#e2e8f0;
  --accent:#0d5c8a; --accent2:#1565a0;
}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);
  font-family:-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
  font-size:14px;line-height:1.5}
.wrap{max-width:1200px;margin:0 auto;padding:20px}
.hero{background:linear-gradient(135deg,#0b3b5e,#1666a6);color:#fff;border-radius:14px;
  padding:22px 26px;margin-bottom:18px;display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between}
.hero h1{margin:0;font-size:22px;font-weight:700;letter-spacing:.3px}
.hero .sub{opacity:.85;font-size:12.5px;margin-top:3px}
.badges{display:flex;gap:8px;flex-wrap:wrap}
.badge{border:1px solid rgba(255,255,255,.35);padding:3px 10px;border-radius:999px;font-size:12px;background:rgba(255,255,255,.12)}
.badge.status-Fail{background:#c62828;border-color:#c62828;font-weight:600}
.badge.status-Pass{background:#2e7d32;border-color:#2e7d32;font-weight:600}
.badge.status-Skipped{background:#b8860b;border-color:#b8860b;font-weight:600}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:18px}
.kpi{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px 16px}
.kpi .label{font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.4px}
.kpi .value{font-size:26px;font-weight:700;margin-top:2px}
.kpi .value.ok{color:var(--pass)} .kpi .value.bad{color:var(--fail)} .kpi .value.warn{color:var(--skip)}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:18px}
.grid .wide{grid-column:1/-1}
.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px 16px}
.card h2{margin:0 0 10px;font-size:13px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px}
.chartbox{position:relative;height:220px}
.chartbox.tall{height:300px}
.section-title{font-size:17px;font-weight:700;margin:22px 0 10px;display:flex;align-items:center;gap:8px}
.section-title .count{font-size:12px;font-weight:600;background:var(--accent);color:#fff;border-radius:999px;padding:1px 9px}
.fails{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:12px}
.fcard{background:var(--card);border:1px solid var(--fail);border-radius:12px;overflow:hidden;display:flex;flex-direction:column}
.fcard .shot{width:100%;max-height:200px;object-fit:cover;background:#0b1220;display:block}
.fcard .shot-missing{width:100%;height:90px;background:repeating-linear-gradient(45deg,#f3f4f6,#f3f4f6 10px,#e5e7eb 10px,#e5e7eb 20px);display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:12px}
.fcard .body{padding:12px 14px}
.fcard .meta{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:6px}
.chip{font-size:11px;font-weight:600;padding:2px 8px;border-radius:999px;background:#eef2f7;color:var(--muted)}
.chip.fail{background:var(--fail-bg);color:var(--fail)}
.chip.pass{background:var(--pass-bg);color:var(--pass)}
.fcard h3{margin:0 0 6px;font-size:14.5px;line-height:1.35}
.fcard .reason{background:var(--fail-bg);color:#7f1d1d;border-left:3px solid var(--fail);
  padding:8px 10px;border-radius:6px;font-size:13px;margin:6px 0}
details{margin-top:8px;font-size:13px}
details summary{cursor:pointer;color:var(--accent);font-weight:600}
details pre{background:#0f172a;color:#cbd5e1;padding:10px;border-radius:8px;overflow:auto;font-size:11.5px;white-space:pre-wrap;word-break:break-word}
.steps{white-space:pre-line;margin:4px 0;color:var(--ink)}
.expected{color:var(--muted);font-size:12.5px}
table{width:100%;border-collapse:collapse;background:var(--card);border-radius:12px;overflow:hidden;font-size:12.5px}
th,td{padding:8px 10px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}
th{background:#0f2a40;color:#fff;font-weight:600;position:sticky;top:0}
tr.status-Fail td{background:var(--fail-bg)} tr.status-Skipped td{background:var(--skip-bg)}
input[type=search]{width:100%;max-width:360px;padding:8px 12px;border:1px solid var(--line);border-radius:8px;margin-bottom:10px;font-size:13px}
a{color:var(--accent);text-decoration:none} a:hover{text-decoration:underline}
.spec{color:var(--muted);font-size:11px}
.note{color:var(--muted);font-size:12px}
@media(max-width:820px){.grid{grid-template-columns:1fr}}
</style>
</head>
<body>
<div class="wrap">
  <header class="hero">
    <div>
      <h1>Meera VAP — Test Dashboard</h1>
      <div class="sub">${run.runAt ? "Run " + formatDate(run.runAt) : ""} &nbsp;·&nbsp; ${run.environment || "environment unknown"} &nbsp;·&nbsp; ${summary.historyRunCount} run(s) stored</div>
    </div>
    <div class="badges">
      <span class="badge status-${run.status}">${run.status}</span>
      ${run.journey ? `<span class="badge">${run.journey}</span>` : ""}
      <span class="badge">${summary.executed} tests</span>
    </div>
  </header>

  <section class="kpis">
    <div class="kpi"><div class="label">Tests executed</div><div class="value">${summary.executed}</div></div>
    <div class="kpi"><div class="label">Passed</div><div class="value ok">${summary.passed}</div></div>
    <div class="kpi"><div class="label">Failed</div><div class="value bad">${summary.failed}</div></div>
    <div class="kpi"><div class="label">Skipped</div><div class="value warn">${summary.skipped}</div></div>
    <div class="kpi"><div class="label">Pass rate</div><div class="value ${summary.passRate >= 80 ? "ok" : summary.passRate >= 50 ? "warn" : "bad"}">${summary.passRate}%</div></div>
    <div class="kpi"><div class="label">Duration</div><div class="value">${summary.durationMin} min</div></div>
  </section>

  ${noRuns
    ? `<p class="note">No test results yet — run the suite first, then refresh this page.</p>`
    : `
  <section class="grid">
    <div class="card wide"><h2>Pass rate trend across runs</h2><div class="chartbox tall"><canvas id="trend"></canvas></div></div>
    <div class="card"><h2>Result split per run</h2><div class="chartbox"><canvas id="perRun"></canvas></div></div>
    <div class="card"><h2>Latest run result</h2><div class="chartbox"><canvas id="donut"></canvas></div></div>
    <div class="card wide"><h2>Module breakdown — latest run</h2><div class="chartbox tall"><canvas id="modules"></canvas></div></div>
    <div class="card wide"><h2>Most common failure reasons</h2><div class="chartbox"><canvas id="reasons"></canvas></div></div>
  </section>

  <div class="section-title">Failed tests <span class="count">${failures.length}</span></div>
  <section class="fails" id="fails"></section>

  <div class="section-title">All tests in this run <span class="count">${allTests.length}</span></div>
  <input type="search" id="search" placeholder="Search tests… (title, ID, module, status)" />
  <table id="alltable">
    <thead><tr><th>Test ID</th><th>Test case</th><th>Module</th><th>Priority</th><th>Status</th><th>Duration</th><th>Spec file</th></tr></thead>
    <tbody></tbody>
  </table>
  `}
</div>

<script>
const DASH = ${JSON.stringify(data)};
const COLOR = { pass: "#2e7d32", fail: "#c62828", skip: "#b8860b" };

document.addEventListener("DOMContentLoaded", () => {
  renderFailures();
  renderTable();
  if (window.Chart) renderCharts();
  else {
    document.querySelectorAll(".card h2").forEach(h => {
      const box = h.parentElement.querySelector(".chartbox");
      if (box) box.innerHTML = '<p class="note">Charts need Chart.js (blocked by this browser / offline). Tables and failure cards still work.</p>';
    });
  }
});

function renderCharts() {
  // 1. Pass-rate trend line
  new Chart(document.getElementById("trend"), {
    type: "line",
    data: {
      labels: DASH.trend.map(t => t.label),
      datasets: [{
        label: "Pass rate %",
        data: DASH.trend.map(t => t.passRate),
        borderColor: COLOR.pass,
        backgroundColor: "rgba(46,125,50,.12)",
        fill: true, tension: .35, pointRadius: 4, pointBackgroundColor: COLOR.pass
      }]
    },
    options: chartBase({ yMax: 100, yLabel: "Pass rate", tooltip: v => v + "%" })
  });

  // 2. Pass / Fail / Skipped per run (stacked)
  new Chart(document.getElementById("perRun"), {
    type: "bar",
    data: {
      labels: DASH.trend.map(t => t.label),
      datasets: [
        { label: "Passed", data: DASH.trend.map(t => t.passed), backgroundColor: COLOR.pass },
        { label: "Failed", data: DASH.trend.map(t => t.failed), backgroundColor: COLOR.fail },
        { label: "Skipped", data: DASH.trend.map(t => t.skipped), backgroundColor: COLOR.skip }
      ]
    },
    options: Object.assign(chartBase({ stack: true }), { scales: { x: { stacked: true, ticks: { maxRotation: 45, font: { size: 10 } } }, y: { stacked: true, beginAtZero: true } } })
  });

  // 3. Latest run donut
  new Chart(document.getElementById("donut"), {
    type: "doughnut",
    data: {
      labels: ["Passed", "Failed", "Skipped"],
      datasets: [{
        data: [DASH.summary.passed, DASH.summary.failed, DASH.summary.skipped],
        backgroundColor: [COLOR.pass, COLOR.fail, COLOR.skip],
        borderWidth: 2, borderColor: "#fff"
      }]
    },
    options: chartBase({ donut: true })
  });

  // 4. Module breakdown (horizontal stacked)
  new Chart(document.getElementById("modules"), {
    type: "bar",
    data: {
      labels: DASH.modules.map(m => m.module.length > 34 ? m.module.slice(0, 33) + "…" : m.module),
      datasets: [
        { label: "Passed", data: DASH.modules.map(m => m.passed), backgroundColor: COLOR.pass },
        { label: "Failed", data: DASH.modules.map(m => m.failed), backgroundColor: COLOR.fail },
        { label: "Skipped", data: DASH.modules.map(m => m.skipped), backgroundColor: COLOR.skip }
      ]
    },
    options: Object.assign(chartBase({ stack: true, horizontal: true }), { indexAxis: "y" })
  });

  // 5. Top failure reasons (horizontal bar)
  new Chart(document.getElementById("reasons"), {
    type: "bar",
    data: {
      labels: DASH.topReasons.map(r => r[0].length > 48 ? r[0].slice(0, 47) + "…" : r[0]),
      datasets: [{ label: "Occurrences", data: DASH.topReasons.map(r => r[1]), backgroundColor: COLOR.fail }]
    },
    options: Object.assign(chartBase({ horizontal: true }), { indexAxis: "y" })
  });
}

function chartBase({ yMax, stack, horizontal, donut, yLabel, tooltip } = {}) {
  const opts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: donut ? { position: "bottom" } : { display: false },
      tooltip: {
        callbacks: tooltip ? { label: c => c.label + ": " + tooltip(c.raw) } : undefined
      }
    }
  };
  if (donut) return opts;
  opts.scales = horizontal
    ? { x: { beginAtZero: true }, y: { beginAtZero: true } }
    : { y: { beginAtZero: true, max: yMax }, x: {} };
  if (stack) {
    if (horizontal) { opts.scales.x.stacked = true; opts.scales.y.stacked = true; }
    else { opts.scales.x.stacked = true; opts.scales.y.stacked = true; }
  }
  return opts;
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function renderFailures() {
  const wrap = document.getElementById("fails");
  if (!wrap) return;
  if (!DASH.failures.length) {
    wrap.innerHTML = '<p class="note">No failures in the latest run 🎉</p>';
    return;
  }
  wrap.innerHTML = DASH.failures.map(f => {
    const shot = f.screenshot
      ? '<img class="shot" src="' + f.screenshot + '" alt="failure screenshot" />'
      : '<div class="shot-missing">No screenshot captured</div>';
    const spec = f.specFile ? esc(f.specFile) + (f.line ? ":" + f.line : "") : "";
    return '<div class="fcard">' + shot +
      '<div class="body">' +
        '<div class="meta"><span class="chip fail">FAIL</span>' +
          (f.testId ? '<span class="chip">' + esc(f.testId) + '</span>' : "") +
          (f.priority ? '<span class="chip">' + esc(f.priority) + '</span>' : "") +
          (f.module ? '<span class="chip">' + esc(f.module) + '</span>' : "") +
        '</div>' +
        '<h3>' + esc(f.title) + '</h3>' +
        '<div class="reason">' + esc(f.friendlyReason || "Failed — see technical error.") + '</div>' +
        (f.expected ? '<p class="expected"><b>Expected:</b> ' + esc(f.expected) + '</p>' : "") +
        '<details><summary>How to test</summary><div class="steps">' + esc(f.steps || "") + '</div></details>' +
        (f.techReason ? '<details><summary>Technical error</summary><pre>' + esc(f.techReason) + '</pre></details>' : "") +
        '<div class="spec">' + spec + '</div>' +
      '</div></div>';
  }).join("");
}

function renderTable() {
  const tbody = document.querySelector("#alltable tbody");
  if (!tbody) return;
  const rows = DASH.allTests;
  function draw(filter) {
    const f = (filter || "").toLowerCase();
    tbody.innerHTML = rows.filter(r =>
      !f || (r.title + " " + r.testId + " " + r.module + " " + r.status + " " + r.specFile).toLowerCase().includes(f)
    ).map(r =>
      '<tr class="status-' + esc(r.status) + '">' +
        '<td>' + esc(r.testId || "") + '</td>' +
        '<td>' + esc(r.title) + '</td>' +
        '<td>' + esc(r.module || "") + '</td>' +
        '<td>' + esc(r.priority || "") + '</td>' +
        '<td>' + esc(r.status) + '</td>' +
        '<td>' + esc(r.durationSec || "") + 's</td>' +
        '<td class="spec">' + esc(r.specFile || "") + (r.line ? ":" + r.line : "") + '</td>' +
      '</tr>'
    ).join("");
    if (!tbody.innerHTML) tbody.innerHTML = '<tr><td colspan="7" class="note">No tests match.</td></tr>';
  }
  draw("");
  const input = document.getElementById("search");
  if (input) input.addEventListener("input", e => draw(e.target.value));
}
</script>
</body>
</html>
`;
}

/** Generate the dashboard HTML file from the latest merged results. Returns the output path. */
export function buildDashboardFile({ log = false, out = outFile } = {}) {
  const data = buildDashboardData();
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, renderHtml(data));
  if (log) {
    console.log(`Dashboard → ${out}`);
    console.log(
      `  Latest run: ${data.run.runAt ? formatDate(data.run.runAt) : "—"} — ` +
        `${data.summary.passed} pass / ${data.summary.failed} fail / ${data.summary.skipped} skipped ` +
        `(${data.summary.passRate}%) · ${data.summary.historyRunCount} run(s) in history`,
    );
    console.log(
      `  ${data.failures.length} failure(s), ${data.allTests.length} test(s) in latest run`,
    );
  }
  return out;
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  buildDashboardFile({ log: true });
}
