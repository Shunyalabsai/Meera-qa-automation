#!/usr/bin/env node
/**
 * Scan Playwright specs and build a test catalog grouped by section.
 * Run: npm run sheet:catalog
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  sectionKeyFromSpecPath,
  tabNameForSection,
} from "../data/sheet-sections.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const suiteDir = path.join(root, "e2e/tests/suite");
const outFile = path.join(root, "e2e/data/test-catalog.json");

const ID_RE =
  /\b(TC-[A-Z0-9]+(?:-[A-Z0-9]+)*|CTA-[A-Z]+-\d+|DR-\d+|OC-\d+|CS-\d+|AR-\d+|SFS-\d+|PG-[A-Z0-9-]+|CM-[A-Z0-9-]+|LG-[A-Z0-9-]+|WH-[A-Z0-9-]+|BL-[A-Z0-9-]+|AL-[A-Z0-9-]+|IS-[A-Z0-9-]+|CL-[A-Z0-9-]+|RC-[A-Z0-9-]+|PN-[A-Z0-9-]+|LC-[A-Z0-9-]+|AU-[A-Z0-9-]+|PT-[A-Z0-9-]+|AG-[A-Z0-9-]+|KB-[A-Z0-9-]+|VC-[A-Z0-9-]+|IN-[A-Z0-9-]+|UI-[A-Z0-9-]+|PF-[A-Z0-9-]+|EC-[A-Z0-9-]+|SC-[A-Z0-9-]+|NAME-[A-Z]+|GREET-[A-Z]+)\b/;

const TAG_RE = /@(\w+)/g;
const PRIORITIES = new Set(["critical", "high", "medium", "low"]);
const TYPES = new Set([
  "positive",
  "negative",
  "edge",
  "ui",
  "manual",
  "cta",
  "journey",
  "smoke",
  "serial",
]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith(".spec.ts")) files.push(full);
  }
  return files;
}

function parseTestTitle(raw) {
  const idMatch = raw.match(ID_RE);
  const id = idMatch?.[0] ?? raw.split(/\s+—|\s+/)[0].trim();
  const tags = [...raw.matchAll(TAG_RE)].map((m) => m[1]);
  const priority = tags.find((t) => PRIORITIES.has(t)) ?? "";
  const type = tags.find((t) => TYPES.has(t)) ?? "";
  const title =
    raw.includes("—") ? raw.split("—").slice(1).join("—").trim() : raw;
  return { id, title, tags, priority, type, rawTitle: raw };
}

function parseSpecFile(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const rel = path.relative(root, filePath).replace(/\\/g, "/");
  const sectionKey = sectionKeyFromSpecPath(rel);
  const tab = tabNameForSection(sectionKey);
  const tests = [];

  const describeStack = [];
  const describeRe = /test\.describe(?:\.configure[^)]*\))?\s*\(\s*["'`]([^"'`]+)["'`]/g;
  const testRe = /test\s*\(\s*["'`]([^"'`]+)["'`]/g;

  const lines = text.split("\n");
  let currentDescribe = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const describeMatch = line.match(/test\.describe(?:\.configure[^)]*\))?\s*\(\s*["'`]([^"'`]+)["'`]/);
    if (describeMatch) {
      currentDescribe = describeMatch[1];
      continue;
    }

    const testMatch = line.match(/test\s*\(\s*["'`]([^"'`]+)["'`]/);
    if (!testMatch) continue;

    const parsed = parseTestTitle(testMatch[1]);
    tests.push({
      ...parsed,
      specFile: rel,
      line: i + 1,
      describe: currentDescribe,
      sectionKey,
      tab,
      catalogKey: `${rel}:${i + 1}:${parsed.id}`,
    });
  }

  return tests;
}

const allTests = [];
for (const file of walk(suiteDir)) {
  allTests.push(...parseSpecFile(file));
}

allTests.sort((a, b) =>
  a.tab.localeCompare(b.tab) ||
  a.specFile.localeCompare(b.specFile) ||
  a.line - b.line,
);

const byTab = {};
for (const t of allTests) {
  if (!byTab[t.tab]) byTab[t.tab] = [];
  byTab[t.tab].push(t);
}

const catalog = {
  generatedAt: new Date().toISOString(),
  totalTests: allTests.length,
  tabs: Object.keys(byTab).sort(),
  tests: allTests,
  byTab,
};

fs.writeFileSync(outFile, JSON.stringify(catalog, null, 2));
console.log(`Wrote ${allTests.length} tests across ${catalog.tabs.length} tabs → ${outFile}`);
for (const tab of catalog.tabs) {
  console.log(`  ${tab}: ${byTab[tab].length}`);
}
