#!/usr/bin/env node
/**
 * Publish merged test results to Google Sheets (one tab per section).
 *
 * Prerequisites:
 * 1. Google Cloud service account with Sheets API enabled
 * 2. Share the spreadsheet with the service account email (Editor)
 * 3. Set GOOGLE_SERVICE_ACCOUNT_JSON (path or inline JSON) in .env
 * 4. Set GOOGLE_RESULTS_SHEET_ID (defaults to Meera master sheet)
 *
 * Run: npm run sheet:publish
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import {
  RESULTS_SHEET_ID,
  RESULT_COLUMNS,
  SUMMARY_TAB,
} from "../data/sheet-sections.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
dotenv.config({ path: path.join(root, ".env") });

const sheetId = process.env.GOOGLE_RESULTS_SHEET_ID ?? RESULTS_SHEET_ID;
const mergedFile = path.join(root, "e2e/data/test-results-merged.json");
const csvDir = path.join(root, "e2e/data/results-sheets");

function b64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function loadCredentials() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error(
      "Set GOOGLE_SERVICE_ACCOUNT_JSON in .env (file path or inline JSON)",
    );
  }
  if (raw.trim().startsWith("{")) return JSON.parse(raw);
  return JSON.parse(fs.readFileSync(path.resolve(root, raw), "utf8"));
}

async function getAccessToken(credentials) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = b64url(
    JSON.stringify({
      iss: credentials.client_email,
      scope: "https://www.googleapis.com/auth/spreadsheets",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const signInput = `${header}.${payload}`;
  const sign = crypto.sign("RSA-SHA256", Buffer.from(signInput), credentials.private_key);
  const jwt = `${signInput}.${b64url(sign)}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) {
    throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.access_token;
}

async function sheetsFetch(token, urlPath, options = {}) {
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}${urlPath}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new Error(`Sheets API ${urlPath}: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

async function ensureTabs(token, tabNames) {
  const meta = await sheetsFetch(token, "?fields=sheets.properties.title");
  const existing = new Set(meta.sheets.map((s) => s.properties.title));
  const requests = [];

  for (const title of tabNames) {
    if (!existing.has(title)) {
      requests.push({ addSheet: { properties: { title } } });
    }
  }

  if (requests.length) {
    await sheetsFetch(token, ":batchUpdate", {
      method: "POST",
      body: JSON.stringify({ requests }),
    });
    console.log(`  Created ${requests.length} new tab(s)`);
  }
}

async function writeTab(token, title, rows) {
  const range = `'${title.replace(/'/g, "''")}'!A1`;
  await sheetsFetch(
    token,
    `/values:batchUpdate`,
    {
      method: "POST",
      body: JSON.stringify({
        valueInputOption: "RAW",
        data: [{ range, values: rows }],
      }),
    },
  );
}

function tabRowsFromMerged(tabData) {
  const rows = [RESULT_COLUMNS];
  for (const r of tabData) {
    rows.push([
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
    ]);
  }
  return rows;
}

function summaryRows(merged) {
  const { run, tabs, runSummary, summary } = merged;
  const runStats = runSummary ?? summary;
  const rows = [
    [
      "Run ID",
      "Run At",
      "Environment",
      "Overall Status",
      "Tests Executed",
      "Passed",
      "Failed",
      "Skipped",
      "Duration (min)",
    ],
  ];
  if (run) {
    rows.push([
      run.runId,
      run.runAt,
      run.environment,
      run.status,
      runStats.executed,
      runStats.pass,
      runStats.fail,
      runStats.skipped,
      (run.stats.durationMs / 60000).toFixed(2),
    ]);
  }
  rows.push([]);
  rows.push(["Section Tab", "Executed", "Pass", "Fail", "Skipped"]);
  for (const tab of Object.keys(tabs).sort()) {
    const t = tabs[tab];
    rows.push([
      tab,
      t.length,
      t.filter((r) => r.status === "Pass").length,
      t.filter((r) => r.status === "Fail").length,
      t.filter((r) => r.status === "Skipped").length,
    ]);
  }
  return rows;
}

/**
 * @param {{ log?: boolean, mergedFile?: string }} [options]
 * @returns {Promise<boolean>}
 */
export async function publishSheetResults(options = {}) {
  const log = options.log ?? false;
  const mergedPath = options.mergedFile ?? mergedFile;

  if (!fs.existsSync(mergedPath)) {
    if (log) {
      console.error("Missing merged results. Run tests first.");
    }
    return false;
  }

  const merged = JSON.parse(fs.readFileSync(mergedPath, "utf8"));
  const runStats = merged.runSummary ?? merged.summary;
  if (!merged.run?.tests?.length || runStats?.executed === 0) {
    if (log) {
      console.error("No executed test results to publish. Run Playwright on staging first.");
    }
    return false;
  }
  const tabNames = [SUMMARY_TAB, ...Object.keys(merged.tabs).sort()];

  let token;
  try {
    const creds = loadCredentials();
    token = await getAccessToken(creds);
    if (log) {
      console.log(`Publishing to sheet ${sheetId} as ${creds.client_email}`);
    }
  } catch (err) {
    if (log) {
      console.error(String(err.message ?? err));
      console.error("\nWithout API credentials, import CSVs manually from:");
      console.error(`  ${csvDir}`);
    }
    return false;
  }

  await ensureTabs(token, tabNames);
  await writeTab(token, SUMMARY_TAB, summaryRows(merged));

  for (const tab of Object.keys(merged.tabs).sort()) {
    await writeTab(token, tab, tabRowsFromMerged(merged.tabs[tab]));
    if (log) {
      console.log(`  ✓ ${tab} (${merged.tabs[tab].length} rows)`);
    }
  }

  if (log) {
    console.log(
      `\nDone → https://docs.google.com/spreadsheets/d/${sheetId}/edit`,
    );
  }
  return true;
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) ===
    path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  publishSheetResults({ log: true })
    .then((ok) => {
      if (!ok) process.exit(1);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
