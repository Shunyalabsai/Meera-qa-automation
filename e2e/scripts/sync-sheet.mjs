#!/usr/bin/env node
/**
 * Sync QA test cases from Google Sheet into e2e/data/qa-test-cases.json
 * Run: npm run sheet:sync
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SHEET_ID = "1V56bydTla54TIyYX4pdlDnUtRaN76oiVK24o6ZOQOaM";
const VOICE_SHEET = "Voice Call / Telephony";
const SHEETS = [
  "Authentication & Login",
  "Agent Builder / Configuration",
  VOICE_SHEET,
  "Knowledge Base & Prompt Configuration",
  "Analytics & Dashboard",
  "Integrations & Webhooks",
  "UI / UX Testing",
  "Performance Testing",
  "Edge Cases",
  "Security Testing",
];

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outFile = path.join(root, "e2e/data/qa-test-cases.json");
const sheetsDir = path.join(root, "e2e/data/sheets");

function slug(name) {
  return name.replace(/ & /g, "___").replace(/ /g, "_").replace(/\//g, "_");
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else inQuotes = false;
      } else cell += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (ch !== "\r") cell += ch;
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function rowToCase(row) {
  if (!row[0]?.startsWith("TC-")) return null;
  return {
    id: row[0].trim(),
    name: (row[1] ?? "").trim(),
    preconditions: (row[2] ?? "").trim(),
    steps: (row[3] ?? "").trim(),
    expected: (row[4] ?? "").trim(),
    priority: (row[5] ?? "").trim(),
    type: (row[6] ?? "").trim(),
  };
}

async function fetchSheet(name) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(name)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${name}: ${res.status}`);
  const text = await res.text();
  fs.mkdirSync(sheetsDir, { recursive: true });
  fs.writeFileSync(path.join(sheetsDir, `${slug(name)}.csv`), text);
  return text;
}

const book = {};
let total = 0;
let voiceCases = [];

for (const name of SHEETS) {
  const csv = await fetchSheet(name);
  const cases = parseCsv(csv).map(rowToCase).filter(Boolean);
  if (name === VOICE_SHEET) {
    voiceCases = cases;
    console.log(`  ${name}: ${cases.length}${cases.length ? "" : " (tab empty via API — keeping e2e/data/voice-call-cases.json)"}`);
    continue;
  }
  book[name] = cases;
  total += cases.length;
  console.log(`  ${name}: ${cases.length}`);
}

fs.writeFileSync(outFile, JSON.stringify(book, null, 2));
console.log(`\nWrote ${total} cases to ${outFile}`);

const voiceOut = path.join(root, "e2e/data/voice-call-cases.json");
if (voiceCases.length) {
  fs.writeFileSync(voiceOut, JSON.stringify(voiceCases, null, 2));
  console.log(`Wrote ${voiceCases.length} Voice Call cases to ${voiceOut}`);
} else {
  console.log(`Voice Call: no rows from API — edit ${voiceOut} manually or re-export tab.`);
}
