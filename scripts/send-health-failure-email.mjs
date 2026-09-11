#!/usr/bin/env node
/**
 * ============================================================================
 * 5-Minute API Health Check Failure Alert Dispatcher
 * Target Recipient: yamini@shunyalabs.in
 * ============================================================================
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const resultsJsonFile = path.join(root, "test-results/results.json");
const RECIPIENT_EMAIL = process.env.ALERT_EMAIL || "yamini@shunyalabs.in";
const GAS_WEBHOOK_URL = process.env.GAS_WEBHOOK_URL || "";

function stripAnsi(text) {
  return String(text ?? "").replace(/\[[0-9;]*m/g, "");
}

function parseFailures() {
  const failures = [];
  if (!fs.existsSync(resultsJsonFile)) {
    return [{
      title: "Health Check Test Execution Failed",
      file: "e2e/tests/suite/api/health.spec.ts",
      error: "Playwright test runner crashed or timed out before outputting results.json",
    }];
  }

  try {
    const report = JSON.parse(fs.readFileSync(resultsJsonFile, "utf8"));
    function walkSuite(suite) {
      for (const spec of suite.specs ?? []) {
        for (const test of spec.tests ?? []) {
          const result = test.results?.[test.results.length - 1];
          if (result && ["failed", "timedOut", "interrupted"].includes(result.status)) {
            const err = result.errors?.map((e) => e.message).join("\n") || "Probe assertion failed";
            failures.push({
              title: spec.title,
              file: spec.file,
              line: spec.line,
              status: result.status,
              durationMs: result.duration,
              error: stripAnsi(err).trim(),
            });
          }
        }
      }
      for (const child of suite.suites ?? []) walkSuite(child);
    }
    for (const s of report.suites ?? []) walkSuite(s);
  } catch (err) {
    failures.push({
      title: "Report Parsing Error",
      file: "test-results/results.json",
      error: err.message,
    });
  }

  return failures;
}

async function sendAlert() {
  const timestamp = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const failures = parseFailures();

  if (failures.length === 0) {
    console.log("✓ No health check failures detected. No email sent.");
    return;
  }

  console.log(`\n🚨 [${timestamp} IST] Detected ${failures.length} API Health Check Failure(s)!`);
  console.log(`📧 Sending failure alert report to ${RECIPIENT_EMAIL}...\n`);

  const failureDetails = failures.map((f, i) => `
Probe #${i + 1}: ${f.title}
Status: ${f.status || "FAILED"}
File: ${f.file}${f.line ? `:${f.line}` : ""}
Error Details:
${f.error}
--------------------------------------------------`).join("\n");

  const emailSubject = `🚨 [CRITICAL ALERT] Meera VAP API Health Check FAILED (${failures.length} issue${failures.length > 1 ? "s" : ""})`;
  const emailBody = `
=====================================================
MEERA VOICE AGENT PLATFORM — 5-MINUTE API HEALTH ALERT
=====================================================

Timestamp: ${timestamp} IST
Environment: https://agents.shunyalabs.ai/vap/
Alert Recipient: ${RECIPIENT_EMAIL}
Failed Probes: ${failures.length}

FAILURE DETAILS:
${failureDetails}

Action Required:
Please inspect the service endpoints and deployment health immediately.

Dashboard URL: https://shunyalabsai.github.io/Meera-qa-automation/
Google Sheet: https://docs.google.com/spreadsheets/d/1QbaJTyhdn1eNIIJkOFbglgyYkpffuN4I2GYUTrhcEvc/edit
`;

  console.log(emailBody);

  // 1. Dispatch via Google Apps Script Webhook (zero SMTP configuration required)
  if (GAS_WEBHOOK_URL) {
    try {
      const res = await fetch(GAS_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "API_HEALTH_FAILED",
          recipient: RECIPIENT_EMAIL,
          subject: emailSubject,
          body: emailBody,
          failures,
          timestamp,
        }),
      });
      console.log(`✓ Dispatched alert via Google Apps Script Webhook (HTTP ${res.status})`);
    } catch (e) {
      console.warn("⚠️ Webhook dispatch warning:", e.message);
    }
  }

  // 2. Append to GitHub Actions Step Summary
  if (process.env.GITHUB_STEP_SUMMARY) {
    const summaryMd = `
## 🚨 API Health Check Failure Alert
- **Timestamp:** ${timestamp} IST
- **Recipient:** \`${RECIPIENT_EMAIL}\`
- **Failed Checks:** ${failures.length}

| Probe Name | Status | Error |
| :--- | :--- | :--- |
${failures.map((f) => `| **${f.title}** | \`FAILED\` | \`${f.error.slice(0, 150).replace(/\n/g, " ")}\` |`).join("\n")}
`;
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summaryMd);
  }
}

sendAlert().catch((err) => {
  console.error("Failed to execute sendAlert:", err);
  process.exit(1);
});
