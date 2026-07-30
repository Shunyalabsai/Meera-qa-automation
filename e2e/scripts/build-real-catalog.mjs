#!/usr/bin/env node
/**
 * Build the REAL coverage catalog (CSV) from the actual Playwright specs.
 *
 * This file is generated 100% from e2e/data/test-catalog.json — a scan of every
 * spec under e2e/tests/suite. Each row therefore maps to a real automated test
 * that runs against the live app, with its real title, tags, and spec file as
 * evidence. Use it as the authoritative "what is actually tested" inventory.
 *
 * Sources:
 *   - e2e/data/test-catalog.json     (run `npm run sheet:catalog` first)
 *
 * Output:
 *   - e2e/REAL-TEST-CATALOG.csv      (one row per de-duplicated TC ID,
 *     grouped by dashboard section. Coverage = Manual when @manual-tagged
 *     — needs a human (voice/telephony, security, real-device) — else Automated.)
 *
 * Run: npm run sheet:catalog && node e2e/scripts/build-real-catalog.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const dataDir = path.join(root, "e2e/data");
const outFile = path.join(root, "e2e/REAL-TEST-CATALOG.csv");
const catalogFile = path.join(dataDir, "test-catalog.json");

if (!fs.existsSync(catalogFile)) {
  console.error(
    "Missing e2e/data/test-catalog.json — run `npm run sheet:catalog` first.",
  );
  process.exit(1);
}

const catalog = JSON.parse(fs.readFileSync(catalogFile, "utf8"));

const PRIORITY_RANK = { critical: 0, high: 1, medium: 2, low: 3, "": 4 };
const TITLECASE = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const GROUP = { build: "BUILD", run: "RUN", analyze: "ANALYZE", settings: "SETTINGS" };
const LEAF = {
  agents: "Agents",
  prompts: "Prompts",
  playground: "Playground",
  campaigns: "Campaigns",
  "phone-numbers": "Phone numbers",
  "live-calls": "Live Calls",
  calls: "Calls",
  recordings: "Recordings",
  insights: "Insights",
  alerts: "Alerts",
  billing: "Billing",
  webhooks: "Webhooks",
  language: "Language",
};
function sectionLabel(specFile) {
  const m = specFile.replace(/\\/g, "/").match(/tests\/suite\/(.+)\.spec\.ts$/);
  if (!m) return "QA Registry";
  let parts = m[1].split("/");
  if (parts[0] === "existing-user" || parts[0] === "new-user") parts = parts.slice(1);
  const [top, sub] = parts;
  if (GROUP[top]) return `${GROUP[top]} › ${LEAF[sub] || (sub ? TITLECASE(sub) : "")}`.trim();
  if (top === "authentication") return "Authentication";
  if (top === "global") return sub ? `Global UI › ${LEAF[sub] || TITLECASE(sub)}` : "Global UI";
  if (top === "workspace") return "Workspace & Account";
  if (top === "qa") return "QA Registry";
  return TITLECASE(top);
}

const byId = new Map();
for (const t of catalog.tests) {
  const id = t.id || "(no-id)";
  if (!byId.has(id)) {
    byId.set(id, {
      id,
      tab: sectionLabel(t.specFile),
      title: t.title || t.rawTitle || "",
      priority: t.priority || "",
      type: t.type || "",
      tags: new Set(t.tags || []),
      specs: new Set([t.specFile]),
    });
  } else {
    const e = byId.get(id);
    (t.tags || []).forEach((x) => e.tags.add(x));
    e.specs.add(t.specFile);
    if ((t.title || "").length > e.title.length) e.title = t.title;
    if (PRIORITY_RANK[t.priority || ""] < PRIORITY_RANK[e.priority || ""]) {
      e.priority = t.priority;
    }
    if (!e.type && t.type) e.type = t.type;
  }
}

const rows = [...byId.values()].filter((r) => r.id !== "(no-id)");

const tabOrder = [
  "Authentication",
  "BUILD › Agents",
  "BUILD › Prompts",
  "BUILD › Playground",
  "RUN › Campaigns",
  "RUN › Phone numbers",
  "RUN › Live Calls",
  "ANALYZE › Calls",
  "ANALYZE › Recordings",
  "ANALYZE › Insights",
  "SETTINGS › Alerts",
  "SETTINGS › Billing",
  "SETTINGS › Webhooks",
  "Global UI",
  "Global UI › Language",
  "Workspace & Account",
  "QA Registry",
];

rows.sort((a, b) => {
  const ra = tabOrder.indexOf(a.tab) === -1 ? 99 : tabOrder.indexOf(a.tab);
  const rb = tabOrder.indexOf(b.tab) === -1 ? 99 : tabOrder.indexOf(b.tab);
  if (ra !== rb) return ra - rb;
  if (a.tab !== b.tab) return a.tab.localeCompare(b.tab);
  const pa = PRIORITY_RANK[a.priority] ?? 4;
  const pb = PRIORITY_RANK[b.priority] ?? 4;
  if (pa !== pb) return pa - pb;
  return a.id.localeCompare(b.id, undefined, { numeric: true });
});

const headers = [
  "Section",
  "Test ID",
  "Test Case",
  "Priority",
  "Type",
  "Coverage",
  "Tags",
  "Spec File(s)",
  "Status (Pass/Fail/Blocked/Skip)",
  "Actual Result / Notes",
  "Tested By",
  "Date Tested",
];

const csvEscape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
const csvRow = (vals) => vals.map(csvEscape).join(",");
const coverageOf = (r) => (r.tags.has("manual") ? "Manual" : "Automated");

const lines = [csvRow(headers)];
let currentTab = null;
for (const r of rows) {
  if (r.tab !== currentTab) {
    currentTab = r.tab;
    const inTab = rows.filter((x) => x.tab === currentTab);
    const manualCount = inTab.filter((x) => x.tags.has("manual")).length;
    lines.push(
      csvRow([
        `=== ${currentTab} (${inTab.length} cases — ${manualCount} manual) ===`,
        ...Array(headers.length - 1).fill(""),
      ]),
    );
  }
  lines.push(
    csvRow([
      r.tab,
      r.id,
      r.title,
      r.priority ? TITLECASE(r.priority) : "",
      r.type ? TITLECASE(r.type) : "",
      coverageOf(r),
      [...r.tags].map((t) => `@${t}`).join(" "),
      [...r.specs].join(" | "),
      "",
      "",
      "",
      "",
    ]),
  );
}

fs.writeFileSync(outFile, lines.join("\r\n") + "\r\n", "utf8");

const byTab = {};
for (const r of rows) {
  byTab[r.tab] ??= { total: 0, manual: 0, automated: 0 };
  byTab[r.tab].total++;
  if (r.tags.has("manual")) byTab[r.tab].manual++;
  else byTab[r.tab].automated++;
}
const totalManual = rows.filter((r) => r.tags.has("manual")).length;
const orderedSections = [
  ...tabOrder.filter((t) => byTab[t]),
  ...Object.keys(byTab).filter((t) => !tabOrder.includes(t)).sort(),
];

console.log(`Wrote ${rows.length} real, de-duplicated cases → ${path.relative(root, outFile)}\n`);
console.log("Section".padEnd(26), "Total", "Manual", "Automated");
for (const tab of orderedSections) {
  const v = byTab[tab];
  console.log(
    tab.padEnd(26),
    String(v.total).padStart(5),
    String(v.manual).padStart(6),
    String(v.automated).padStart(9),
  );
}
console.log(
  "\nTOTAL".padEnd(26),
  String(rows.length).padStart(5),
  String(totalManual).padStart(6),
  String(rows.length - totalManual).padStart(9),
);
