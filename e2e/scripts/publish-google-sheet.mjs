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
  SECTION_TAB_NAMES,
  SUMMARY_TAB,
} from "../data/sheet-sections.mjs";
import { buildFormatRequests } from "./sheet-format.mjs";
import {
  SUMMARY_WIDTH,
  buildSummarySheetRows,
  buildTabSheetRows,
  loadSheetRunHistory,
} from "./sheet-history.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
dotenv.config({ path: path.join(root, ".env") });

const sheetId = process.env.GOOGLE_RESULTS_SHEET_ID ?? RESULTS_SHEET_ID;
const mergedFile = path.join(root, "e2e/data/test-results-merged.json");
const csvDir = path.join(root, "e2e/data/results-sheets");

/** Column index of "Screenshot" in RESULT_COLUMNS (0-based). */
const SCREENSHOT_COL = 10;
const SCREENSHOT_ROW_HEIGHT = 180;
const RESULT_COLUMNS_LENGTH = 13;

/** Drive folder that holds uploaded failure screenshots. */
const SCREENSHOT_ROOT_FOLDER = "Meera VAP Test Report Screenshots";

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

async function driveFetch(token, urlPath, options = {}) {
  const res = await fetch(`https://www.googleapis.com/drive/v3${urlPath}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    return { ok: false, status: res.status, body };
  }
  return { ok: true, status: res.status, body: await res.json() };
}

/** Drive API token (Drive API must be enabled on the GCP project). */
async function getDriveAccessToken(credentials) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = b64url(
    JSON.stringify({
      iss: credentials.client_email,
      scope: "https://www.googleapis.com/auth/drive.file",
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
    throw new Error(`Drive token exchange failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()).access_token;
}

/**
 * Upload a local PNG to Drive as "anyone with the link" readable and return
 * the IMAGE()-ready URL. `null` means the file could not be uploaded.
 */
async function uploadScreenshot(driveToken, filePath, name) {
  const data = fs.readFileSync(filePath);
  const up = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=media",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${driveToken}`,
        "Content-Type": "image/png",
      },
      body: data,
    },
  );
  if (!up.ok) {
    throw new Error(`upload ${up.status}`);
  }
  const fileId = (await up.json()).id;

  await driveFetch(driveToken, `/files/${fileId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, mimeType: "image/png" }),
  });

  const perm = await driveFetch(driveToken, `/files/${fileId}/permissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: "reader", type: "anyone" }),
  });
  if (!perm.ok) {
    throw new Error(`permission ${perm.status}`);
  }

  return `https://drive.google.com/uc?id=${fileId}`;
}

/** Find or create the run's screenshot folder under the root folder. */
async function ensureRunFolder(driveToken, runId, rootFolderId) {
  const q = encodeURIComponent(
    `'${rootFolderId}' in parents and name = '${runId}' and trashed = false`,
  );
  const list = await driveFetch(driveToken, `/files?q=${q}&fields=files(id,name)&pageSize=5`);
  if (list.ok && list.body.files?.length) return list.body.files[0].id;

  const created = await driveFetch(driveToken, "/files", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: runId,
      mimeType: "application/vnd.google-apps.folder",
      parents: [rootFolderId],
    }),
  });
  if (!created.ok) throw new Error(`create folder ${created.status}`);
  return created.body.id;
}

async function ensureRootFolder(driveToken) {
  const q = encodeURIComponent(
    `mimeType = 'application/vnd.google-apps.folder' and name = '${SCREENSHOT_ROOT_FOLDER}' and trashed = false`,
  );
  const list = await driveFetch(driveToken, `/files?q=${q}&fields=files(id,name)&pageSize=5`);
  if (list.ok && list.body.files?.length) return list.body.files[0].id;
  const created = await driveFetch(driveToken, "/files", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: SCREENSHOT_ROOT_FOLDER,
      mimeType: "application/vnd.google-apps.folder",
    }),
  });
  if (!created.ok) throw new Error(`create root folder ${created.status}`);
  return created.body.id;
}

/**
 * Replace local screenshot paths in result tabs with inline IMAGE() formulas.
 * Mutates `sheetTabs` in place. Returns { uploaded, skipped, disabled } counts.
 */
async function embedFailureScreenshots(sheetTabs, runId, log) {
  let uploaded = 0;
  let skipped = 0;
  let disabled = false;
  let driveToken = null;
  let rootFolderId = null;
  let runFolderId = null;

  const filesToUpload = [];
  for (const [tab, rows] of Object.entries(sheetTabs ?? {})) {
    for (let i = 1; i < rows.length; i++) {
      const cell = rows[i][SCREENSHOT_COL];
      if (cell && fs.existsSync(cell)) {
        filesToUpload.push({ tab, row: i, filePath: cell });
      }
    }
  }
  if (!filesToUpload.length) return { uploaded: 0, skipped: 0, disabled: false };

  try {
    const creds = loadCredentials();
    driveToken = await getDriveAccessToken(creds);
    rootFolderId = await ensureRootFolder(driveToken);
    runFolderId = await ensureRunFolder(driveToken, runId, rootFolderId);
  } catch (err) {
    const isDisabled = /accessNotConfigured|disabled|Drive API has not been used/i.test(
      String(err?.message ?? err),
    );
    disabled = true;
    if (log) {
      console.warn(
        isDisabled
          ? `  [screenshots] Drive API is DISABLED — enable it at https://console.cloud.google.com/apis/api/drive.googleapis.com/overview to embed inline failure screenshots. Falling back to local file links.`
          : `  [screenshots] Drive upload unavailable (${err.message}). Falling back to local file links.`,
      );
    }
    return { uploaded: 0, skipped: filesToUpload.length, disabled };
  }

  for (const { tab, row, filePath } of filesToUpload) {
    const name = path.basename(filePath);
    try {
      const url = await uploadScreenshot(driveToken, filePath, name);
      sheetTabs[tab][row][SCREENSHOT_COL] = `=IMAGE("${url}", 2)`;
      uploaded++;
    } catch (err) {
      if (log) {
        console.warn(`  [screenshots] Skipped ${name}: ${err.message}`);
      }
      skipped++;
    }
  }
  if (log) {
    console.log(`  [screenshots] Embedded ${uploaded} inline image(s), ${skipped} skipped`);
  }
  return { uploaded, skipped, disabled };
}

/** Clear a tab's whole grid so stale rows below the new data never linger. */
async function clearTab(token, title) {
  const range = `'${title.replace(/'/g, "''")}'!A1:ZZ20000`;
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}:clear`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );
}

/** Delete any tab not in keepTitles (stale sections, legacy "existing-user", empty shells). */
async function deleteStaleTabs(token, keepTitles) {
  const meta = await sheetsFetch(token, "?fields=sheets.properties(title,sheetId)");
  const keep = new Set(keepTitles);
  const toDelete = (meta.sheets ?? []).filter((s) => !keep.has(s.properties.title));
  if (!toDelete.length) return 0;
  await sheetsFetch(token, ":batchUpdate", {
    method: "POST",
    body: JSON.stringify({
      requests: toDelete.map((s) => ({
        deleteSheet: { sheetId: s.properties.sheetId },
      })),
    }),
  });
  return toDelete.length;
}

/** Set a fixed row height on every row that contains an inline screenshot image. */
async function setScreenshotRowHeights(token, sheetTabs, sheetIdMap) {
  const requests = [];
  for (const [tab, rows] of Object.entries(sheetTabs ?? {})) {
    const sheetIdNum = sheetIdMap[tab];
    if (sheetIdNum == null) continue;
    for (let i = 1; i < rows.length; i++) {
      const cell = String(rows[i][SCREENSHOT_COL] ?? "");
      if (cell.startsWith("=IMAGE(")) {
        requests.push({
          updateDimensionProperties: {
            range: {
              sheetId: sheetIdNum,
              dimension: "ROWS",
              startIndex: i,
              endIndex: i + 1,
            },
            properties: { pixelSize: SCREENSHOT_ROW_HEIGHT },
            fields: "pixelSize",
          },
        });
      }
    }
  }
  if (requests.length) {
    await sheetsFetch(token, ":batchUpdate", {
      method: "POST",
      body: JSON.stringify({ requests }),
    });
  }
}

async function getSheetIdMap(token) {
  const meta = await sheetsFetch(token, "?fields=sheets.properties");
  return Object.fromEntries(
    meta.sheets.map((s) => [s.properties.title, s.properties.sheetId]),
  );
}

/** Fetch each tab's current merge ranges (keyed by tab title). */
async function getMergeMap(token) {
  const meta = await sheetsFetch(token, "?fields=sheets.properties.title,sheets.merges");
  return Object.fromEntries(
    meta.sheets.map((s) => [s.properties.title, s.merges ?? []]),
  );
}

/**
 * Remove ALL merges on a tab. Stale merges from a previous layout silently
 * drop values written into non-anchor cells, so we unmerge before rewriting.
 */
async function unmergeAllCells(token, sheetIdNum, merges) {
  if (!merges?.length) return;
  await sheetsFetch(token, ":batchUpdate", {
    method: "POST",
    body: JSON.stringify({
      requests: merges.map((range) => ({ unmergeCells: { range } })),
    }),
  });
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

  // Upload failure screenshots to Drive and swap local paths for inline IMAGE().
  const runId = merged.run?.runId ?? "";
  const shots = await embedFailureScreenshots(sheetPayload.sheetTabs, runId, log);
  if (log && shots.skipped && !shots.disabled) {
    console.warn(`  [screenshots] ${shots.skipped} file(s) could not be uploaded — left as local paths`);
  }

  await ensureTabs(token, tabNames);
  // Delete every tab we aren't about to write — keeps the sheet to exactly
  // the current run's sections (no stale tabs, no empty shells).
  const deleted = await deleteStaleTabs(token, tabNames);
  if (log && deleted) {
    console.log(`  Removed ${deleted} stale/legacy tab(s)`);
  }
  const sheetIdMap = await getSheetIdMap(token);
  const mergeMap = await getMergeMap(token);

  await unmergeAllCells(token, sheetIdMap[SUMMARY_TAB], mergeMap[SUMMARY_TAB]);
  await clearTab(token, SUMMARY_TAB);
  await writeTab(token, SUMMARY_TAB, sheetPayload.summarySheetRows);
  await applyTabFormatting(
    token,
    SUMMARY_TAB,
    sheetPayload.summarySheetMeta,
    SUMMARY_WIDTH,
    sheetIdMap,
  );
  if (log) {
    console.log(`  ✓ ${SUMMARY_TAB} (${sheetPayload.summarySheetRows.length - 1} row(s))`);
  }

  for (const tab of sheetPayload.tabNames) {
    const rows = sheetPayload.sheetTabs[tab];
    const rowMeta = sheetPayload.sheetTabMeta[tab] ?? [];
    await unmergeAllCells(token, sheetIdMap[tab], mergeMap[tab]);
    await clearTab(token, tab);
    await writeTab(token, tab, rows);
    await applyTabFormatting(
      token,
      tab,
      rowMeta,
      rows[0]?.length ?? RESULT_COLUMNS_LENGTH,
      sheetIdMap,
    );
    const dataRows = rows.length > 1 ? rows.length - 1 : 0;
    if (log) {
      console.log(`  ✓ ${tab} (${dataRows} row(s))`);
    }
  }

  await setScreenshotRowHeights(token, sheetPayload.sheetTabs, sheetIdMap);

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
