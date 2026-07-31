#!/usr/bin/env node
/**
 * Fetch the manual QA test-case definitions from the Meera_VAP_QA_TestCases
 * spreadsheet and emit e2e/data/manual-test-cases.mjs.
 *
 * The manual sheet is the human-authored source of truth for "Test Steps" and
 * "Expected Result" per TC ID. The report pipeline joins these onto automated
 * results by TC ID so every row in the report is readable by non-technical
 * reviewers.
 *
 * Run: npm run sheet:manual-cases
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
dotenv.config({ path: path.join(root, ".env") });

const MANUAL_SHEET_ID = process.env.MANUAL_CASES_SHEET_ID ?? "1V56bydTla54TIyYX4pdlDnUtRaN76oiVK24o6ZOQOaM";
const OUT_FILE = path.join(root, "e2e/data/manual-test-cases.mjs");

/** Tabs that contain test-case rows (skip the cover "Master Sheet"). */
const SKIP_TABS = new Set(["Master Sheet"]);

function b64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function listCaseTabs(token) {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${MANUAL_SHEET_ID}?fields=sheets.properties.title`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) {
    throw new Error(`Failed to read sheet metadata: ${res.status} ${await res.text()}`);
  }
  const meta = await res.json();
  return (meta.sheets ?? [])
    .map((s) => s.properties.title)
    .filter((title) => !SKIP_TABS.has(title));
}

function loadCredentials() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("Set GOOGLE_SERVICE_ACCOUNT_JSON in .env");
  if (raw.trim().startsWith("{")) return JSON.parse(raw);
  return JSON.parse(fs.readFileSync(path.resolve(root, raw), "utf8"));
}

async function getAccessToken(credentials) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = b64url(
    JSON.stringify({
      iss: credentials.client_email,
      scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
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
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}

async function readTab(token, tab) {
  const range = `'${tab.replace(/'/g, "''")}'!A1:G1000`;
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${MANUAL_SHEET_ID}/values/${encodeURIComponent(range)}?valueRenderOption=FORMATTED_VALUE`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) {
    throw new Error(`Failed to read "${tab}": ${res.status} ${await res.text()}`);
  }
  return (await res.json()).values ?? [];
}

function cleanCell(v) {
  return String(v ?? "").replace(/\r\n/g, "\n").trim();
}

function main() {
  const creds = loadCredentials();
  getAccessToken(creds)
    .then(async (token) => {
      const cases = {};
      const tabs = await listCaseTabs(token);
      for (const tab of tabs) {
        const rows = await readTab(token, tab);
        if (!rows.length) {
          console.warn(`  [warn] "${tab}" returned no rows`);
          continue;
        }
        const header = rows[0].map((c) => cleanCell(c));
        const idCol = header.indexOf("TC ID");
        const nameCol = header.indexOf("Test Case Name") >= 0 ? header.indexOf("Test Case Name") : -1;
        const preCol = header.indexOf("Preconditions");
        const stepsCol = header.indexOf("Test Steps");
        const expCol = header.indexOf("Expected Result");
        const priCol = header.indexOf("Priority");
        const typeCol = header.indexOf("Test Case Type");

        let count = 0;
        for (const row of rows.slice(1)) {
          const id = cleanCell(row[idCol] ?? "");
          if (!/^TC-[A-Z]+-\d+/.test(id)) continue;
          cases[id] = {
            id,
            name: nameCol >= 0 ? cleanCell(row[nameCol]) : "",
            module: tab,
            preconditions: preCol >= 0 ? cleanCell(row[preCol]) : "",
            steps: stepsCol >= 0 ? cleanCell(row[stepsCol]) : "",
            expected: expCol >= 0 ? cleanCell(row[expCol]) : "",
            priority: priCol >= 0 ? cleanCell(row[priCol]) : "",
            type: typeCol >= 0 ? cleanCell(row[typeCol]) : "",
          };
          count++;
        }
        console.log(`  ${tab}: ${count} case(s)`);
      }

      const sorted = Object.fromEntries(Object.entries(cases).sort(([a], [b]) => a.localeCompare(b)));
      const body = `/**\n * Manual QA test-case definitions (authoritative "Test Steps" / "Expected Result").\n *\n * Generated by: npm run sheet:manual-cases\n * Source sheet: ${MANUAL_SHEET_ID}\n * Regenerate whenever the manual test-case sheet is updated.\n * Do NOT hand-edit — run the fetch script instead.\n */\nexport const MANUAL_TEST_CASES = ${JSON.stringify(sorted, null, 2)};\n\nexport const MANUAL_CASE_IDS = Object.keys(MANUAL_TEST_CASES);\n`;
      fs.writeFileSync(OUT_FILE, body);
      console.log(`\nWrote ${Object.keys(cases).length} cases → ${path.relative(root, OUT_FILE)}`);
    })
    .catch((err) => {
      console.error("[fetch-manual-cases] Failed:", err.message);
      process.exit(1);
    });
}

main();
