#!/usr/bin/env node
/**
 * Pre-flight scheduler deduplication check.
 * Ensures local macOS LaunchAgent scheduler does NOT run if Google Apps Script
 * or GitHub Actions has already triggered or completed a run for the current time slot.
 *
 * Exit codes:
 *   0 = Safe to proceed with local execution (no cloud run detected)
 *   2 = Skip local execution (cloud/Apps Script run already active or completed)
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import dotenv from "dotenv";
import { RESULTS_SHEET_ID } from "../data/sheet-sections.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
dotenv.config({ path: path.join(root, ".env") });

const sheetId = process.env.GOOGLE_RESULTS_SHEET_ID ?? RESULTS_SHEET_ID;

function b64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function loadCredentials() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    if (raw.trim().startsWith("{")) return JSON.parse(raw);
    const resolvedPath = path.resolve(root, raw);
    if (fs.existsSync(resolvedPath)) {
      return JSON.parse(fs.readFileSync(resolvedPath, "utf8"));
    }
  } catch {
    return null;
  }
  return null;
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

function getCurrentSlotInfo() {
  const now = new Date();
  const istFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });

  const parts = Object.fromEntries(
    istFormatter.formatToParts(now).map((p) => [p.type, p.value]),
  );

  const hour = parseInt(parts.hour, 10);
  const dateStr = `${parts.year}-${parts.month}-${parts.day}`;
  const isMorning = hour >= 3 && hour < 12;
  const slotName = isMorning ? "Morning Run (4:00 AM)" : "Evening Run (5:00 PM)";

  return { dateStr, hour, slotName };
}

async function checkSheetExecutionHistory(credentials, slotInfo) {
  try {
    const token = await getAccessToken(credentials);
    const range = encodeURIComponent("'Execution History'!A2:H20");
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      // If tab doesn't exist yet or other 4xx, allow proceeding
      return false;
    }

    const data = await res.json();
    const rows = data.values || [];

    for (const row of rows) {
      if (!row || row.length === 0) continue;
      const [timestamp, project, slot, status, passRate, counts, dashUrl, details] = row;
      const rowStr = (row.join(" ") || "").toLowerCase();

      // Check if this row matches today's date & current slot
      const matchesDate = timestamp && timestamp.startsWith(slotInfo.dateStr);
      const matchesSlot = slot && slot.toLowerCase().includes(slotInfo.slotName.toLowerCase().slice(0, 7));

      if (matchesDate && matchesSlot) {
        const isTriggeredOrCompleted =
          status === "TRIGGERED" ||
          status === "PASSED" ||
          status === "SUCCESS" ||
          status === "RUNNING";

        const isGasOrCloud =
          rowStr.includes("gas") ||
          rowStr.includes("apps script") ||
          rowStr.includes("github") ||
          rowStr.includes("cloud");

        if (isTriggeredOrCompleted && isGasOrCloud) {
          console.log(
            `[scheduler-dedup] 🛑 Cloud/Apps Script run already detected in Execution History:`
          );
          console.log(
            `                  Date: ${timestamp} | Slot: ${slot} | Status: ${status} | Details: ${details || "N/A"}`
          );
          return true;
        }
      }
    }
  } catch (err) {
    console.warn("[scheduler-dedup] Note: Could not query Execution History sheet:", err.message);
  }
  return false;
}

function checkGitRecentCloudCommits(slotInfo) {
  try {
    // Fetch latest remotes silently
    execSync("git fetch personal main --quiet 2>/dev/null || true", { cwd: root });
    execSync("git fetch org main --quiet 2>/dev/null || true", { cwd: root });

    // Look for commits in the last 2 hours by github-actions
    const recentCommits = execSync(
      'git log --since="2 hours ago" --author="github-actions" --pretty=format:"%h %an %ad %s" --date=iso 2>/dev/null || true',
      { cwd: root, encoding: "utf8" },
    );

    if (recentCommits && recentCommits.trim()) {
      console.log(`[scheduler-dedup] 🛑 Recent GitHub Actions automated commit found:`);
      console.log(`                  ${recentCommits.split("\n")[0]}`);
      return true;
    }
  } catch {
    // ignore git check errors
  }
  return false;
}

async function main() {
  const slotInfo = getCurrentSlotInfo();
  console.log(`[scheduler-dedup] Checking slot: ${slotInfo.slotName} (${slotInfo.dateStr} IST)`);

  const credentials = loadCredentials();
  if (credentials) {
    const cloudRunFoundInSheet = await checkSheetExecutionHistory(credentials, slotInfo);
    if (cloudRunFoundInSheet) {
      console.log(`[scheduler-dedup] ⏭️ Skipping local execution to prevent duplicate output.`);
      process.exit(2);
    }
  }

  const cloudCommitFound = checkGitRecentCloudCommits(slotInfo);
  if (cloudCommitFound) {
    console.log(`[scheduler-dedup] ⏭️ Skipping local execution to prevent duplicate output.`);
    process.exit(2);
  }

  console.log(`[scheduler-dedup] ✅ No conflicting cloud run found for ${slotInfo.slotName}. Safe to run locally.`);
  process.exit(0);
}

main().catch((err) => {
  console.warn("[scheduler-dedup] Check encountered error, allowing local run as fallback:", err);
  process.exit(0);
});
