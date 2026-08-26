#!/usr/bin/env node
/**
 * Export + publish after a Playwright run (called from sheet-results.reporter).
 * Run manually: npm run sheet:update
 */
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { exportSheetResults } from "./export-results-sheet.mjs";
import { publishSheetResults } from "./publish-google-sheet.mjs";
import { buildDashboardFile } from "./build-dashboard.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
dotenv.config({ path: path.join(root, ".env") });

function syncGitDashboard() {
  try {
    const status = execSync("git status --porcelain docs/ index.html e2e/data/sheet-run-history.json", {
      cwd: root,
      encoding: "utf8",
    });
    if (!status.trim()) {
      console.log("[dashboard-sync] Dashboard and history are already up to date in git.");
      return;
    }
    console.log("[dashboard-sync] Auto-committing and pushing updated dashboard to remotes…");
    execSync("git add docs/ index.html e2e/data/sheet-run-history.json", { cwd: root, stdio: "inherit" });
    execSync('git commit -m "Auto-update QA dashboard and execution history\n\nCo-Authored-By: Claude <noreply@anthropic.com>"', {
      cwd: root,
      stdio: "inherit",
    });

    try {
      execSync("git push personal main", { cwd: root, stdio: "inherit" });
      console.log("[dashboard-sync] ✓ Pushed to personal remote (meera-automation)");
    } catch (e) {
      console.warn("[dashboard-sync] Warning: git push to personal failed:", e.message);
    }

    try {
      execSync("git push org main", { cwd: root, stdio: "inherit" });
      console.log("[dashboard-sync] ✓ Pushed to org remote (Meera-qa-automation)");
    } catch (e) {
      console.warn("[dashboard-sync] Warning: git push to org failed:", e.message);
    }
  } catch (err) {
    console.warn("[dashboard-sync] Auto-commit/push skipped or encountered error:", err.message);
  }
}

async function main() {
  const exported = exportSheetResults({ log: true });
  if (!exported) {
    process.exit(1);
  }

  buildDashboardFile({ log: true });

  const published = await publishSheetResults({ log: true });
  if (!published) {
    process.exit(1);
  }

  syncGitDashboard();
}

main().catch((err) => {
  console.error("[sheet] Auto-update failed:", err);
  process.exit(1);
});
