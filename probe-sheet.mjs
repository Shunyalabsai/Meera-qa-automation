#!/usr/bin/env node
/** Probe two Google Sheets (metadata + first rows) via service account. No secrets printed. */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.join(process.cwd(), ".env") });

function b64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function loadCredentials() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (raw.trim().startsWith("{")) return JSON.parse(raw);
  return JSON.parse(fs.readFileSync(path.resolve(process.cwd(), raw), "utf8"));
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
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
  return (await res.json()).access_token;
}

async function fetchJson(token, url) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return { error: `${res.status} ${(await res.text()).slice(0, 300)}` };
  return res.json();
}

async function probe(token, sheetId) {
  console.log(`\n========== SHEET ${sheetId} ==========`);
  const meta = await fetchJson(
    token,
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?fields=properties(title),sheets.properties(title,sheetId,gridProperties)`,
  );
  if (meta.error) {
    console.log(`  ERROR: ${meta.error}`);
    return;
  }
  console.log(`  Spreadsheet title: ${meta.properties?.title ?? "(none)"}`);
  for (const s of meta.sheets ?? []) {
    const p = s.properties;
    console.log(
      `  TAB: "${p.title}"  rows=${p.gridProperties.rowCount}  cols=${p.gridProperties.columnCount}`,
    );
  }
  // sample first tab values
  if (meta.sheets?.length) {
    const firstTitle = meta.sheets[0].properties.title;
    const vals = await fetchJson(
      token,
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/'${firstTitle.replace(/'/g, "''")}'!A1:Z8?valueRenderOption=FORMATTED_VALUE`,
    );
    if (vals.error) {
      console.log(`  ${firstTitle} values ERROR: ${vals.error}`);
    } else {
      console.log(`  --- First 8 rows of "${firstTitle}" ---`);
      for (const row of vals.values ?? []) {
        console.log(
          "  | " +
            row.map((c) => String(c ?? "").slice(0, 40)).join(" | "),
        );
      }
    }
  }
}

const creds = loadCredentials();
console.log(`Service account: ${creds.client_email}`);
const token = await getAccessToken(creds);

const envSheet = process.env.GOOGLE_RESULTS_SHEET_ID;
await probe(token, envSheet);
await probe(token, "1V56bydTla54TIyYX4pdlDnUtRaN76oiVK24o6ZOQOaM");
