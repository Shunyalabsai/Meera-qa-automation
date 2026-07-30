#!/usr/bin/env node
/**
 * Publish merged test results to Google Sheets (one tab per section).
 *
 * Prerequisites:
 * 1. Google Cloud service account with Sheets API enabled
 * 2. Share the spreadsheet with the service account email (Editor)
 * 3. Set GOOGLE_SERVICE_ACCOUNT_JSON (path or inline JSON) in .env
 * 4. Set GOOGLE_RESULTS_SHEET_ID (defaults to Meera master sheet)
 * 5. Optional: GOOGLE_SHEET_REPO_URL for clickable spec links
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
  SUMMARY_TAB,
} from "../data/sheet-sections.mjs";
import { buildFormatRequests } from "./sheet-format.mjs";
import {
  SUMMARY_COLUMNS,
  buildSummarySheetRows,
  buildTabSheetRows,
  loadSheetRunHistory,
} from "./sheet-history.mjs";

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

async function getSheetIdMap(token) {
  const meta = await sheetsFetch(token, "?fields=sheets.properties");
  return Object.fromEntries(
    meta.sheets.map((s) => [s.properties.title, s.properties.sheetId]),
  );
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
  await sheetsFetch(token, `/values:batchUpdate`, {
    method: "POST",
    body: JSON.stringify({
      valueInputOption: "USER_ENTERED",
      data: [{ range, values: rows }],
    }),
  });
}

async function applyTabFormatting(token, title, rowMeta, columnCount, sheetIdMap) {
  const sheetIdNum = sheetIdMap[title];
  if (sheetIdNum == null || !rowMeta?.length) return;

  const requests = buildFormatRequests(sheetIdNum, rowMeta, columnCount);
  if (!requests.length) return;

  await sheetsFetch(token, ":batchUpdate", {
    method: "POST",
    body: JSON.stringify({ requests }),
  });
}

function normalizeTabPayload(tabData, fallbackMeta) {
  if (Array.isArray(tabData)) {
    return { rows: tabData, rowMeta: fallbackMeta ?? [] };
  }
  return {
    rows: tabData.rows ?? [],
    rowMeta: tabData.rowMeta ?? fallbackMeta ?? [],
  };
}

function resolveSheetPayload(merged) {
  if (merged.sheetTabs && merged.summarySheetRows) {
    const tabNames = merged.tabNames ?? Object.keys(merged.sheetTabs).sort();
    const sheetTabs = {};
    const sheetTabMeta = merged.sheetTabMeta ?? {};

    for (const tab of tabNames) {
      const normalized = normalizeTabPayload(
        merged.sheetTabs[tab],
        sheetTabMeta[tab],
      );
      sheetTabs[tab] = normalized.rows;
      sheetTabMeta[tab] = normalized.rowMeta;
    }

    const summary = normalizeTabPayload(
      merged.summarySheetRows,
      merged.summarySheetMeta,
    );

    return {
      tabNames,
      sheetTabs,
      sheetTabMeta,
      summarySheetRows: summary.rows,
      summarySheetMeta: summary.rowMeta,
    };
  }

  const history = loadSheetRunHistory();
  if (history.runs.length) {
    const tabNames = [
      ...new Set(history.runs.flatMap((r) => Object.keys(r.rowsByTab ?? {}))),
    ].sort();

    const sheetTabs = {};
    const sheetTabMeta = {};
    for (const tab of tabNames) {
      const built = buildTabSheetRows(history.runs, tab);
      sheetTabs[tab] = built.rows;
      sheetTabMeta[tab] = built.rowMeta;
    }

    const summaryBuilt = buildSummarySheetRows(history.runs);
    return {
      tabNames,
      sheetTabs,
      sheetTabMeta,
      summarySheetRows: summaryBuilt.rows,
      summarySheetMeta: summaryBuilt.rowMeta,
    };
  }

  return null;
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
  const sheetPayload = resolveSheetPayload(merged);

  if (!sheetPayload?.tabNames?.length) {
    if (log) {
      console.error("No sheet history to publish. Run sheet:export first.");
    }
    return false;
  }

  const tabNames = [SUMMARY_TAB, ...sheetPayload.tabNames];

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
  const sheetIdMap = await getSheetIdMap(token);

  await writeTab(token, SUMMARY_TAB, sheetPayload.summarySheetRows);
  await applyTabFormatting(
    token,
    SUMMARY_TAB,
    sheetPayload.summarySheetMeta,
    SUMMARY_COLUMNS.length,
    sheetIdMap,
  );
  if (log) {
    console.log(`  ✓ ${SUMMARY_TAB} (${sheetPayload.summarySheetRows.length - 1} row(s))`);
  }

  for (const tab of sheetPayload.tabNames) {
    const rows = sheetPayload.sheetTabs[tab];
    const rowMeta = sheetPayload.sheetTabMeta[tab] ?? [];
    await writeTab(token, tab, rows);
    await applyTabFormatting(
      token,
      tab,
      rowMeta,
      rows[0]?.length ?? 14,
      sheetIdMap,
    );
    const dataRows = rows.length > 1 ? rows.length - 1 : 0;
    if (log) {
      console.log(`  ✓ ${tab} (${dataRows} row(s))`);
    }
  }

  if (log && merged.historyRunCount) {
    console.log(`  History: ${merged.historyRunCount} run(s) on sheet`);
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
