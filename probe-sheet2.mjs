#!/usr/bin/env node
/** Deep probe: manual test-case sheet section tabs + report sheet BUILD tab. No secrets printed. */
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
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
  return (await res.json()).access_token;
}

async function fetchJson(token, url) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return { error: `${res.status} ${(await res.text()).slice(0, 300)}` };
  return res.json();
}

async function dumpTab(token, sheetId, tab, maxRows = 6, maxCols = 20) {
  const range = `'${tab.replace(/'/g, "''")}'!A1:${String.fromCharCode(64 + maxCols)}${maxRows}`;
  const vals = await fetchJson(
    token,
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?valueRenderOption=FORMATTED_VALUE`,
  );
  console.log(`\n  --- "${tab}" (first ${maxRows} rows, ${maxCols} cols) ---`);
  if (vals.error) {
    console.log(`  ERROR: ${vals.error}`);
    return;
  }
  for (let i = 0; i < (vals.values ?? []).length; i++) {
    const row = vals.values[i];
    console.log(`  R${i + 1}: ` + row.map((c) => `"${String(c ?? "").slice(0, 28)}"`).join(" | "));
  }
}

const creds = loadCredentials();
const token = await getAccessToken(creds);

const manual = "1V56bydTla54TIyYX4pdlDnUtRaN76oiVK24o6ZOQOaM";
const report = process.env.GOOGLE_RESULTS_SHEET_ID;

console.log("################ MANUAL TEST-CASE SHEET SECTION TABS ################");
for (const tab of ["Authentication & Login", "Agent Builder / Configuration", "Edge Cases"]) {
  await dumpTab(token, manual, tab);
}

console.log("\n\n################ REPORT SHEET BUILD TAB ################");
await dumpTab(token, report, "BUILD", 10, 20);
