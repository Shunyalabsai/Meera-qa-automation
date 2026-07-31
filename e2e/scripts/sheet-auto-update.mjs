#!/usr/bin/env node
/**
 * Export + publish after a Playwright run (called from sheet-results.reporter).
 * Run manually: npm run sheet:update
 */
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { exportSheetResults } from "./export-results-sheet.mjs";
import { publishSheetResults } from "./publish-google-sheet.mjs";
import { buildDashboardFile } from "./build-dashboard.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
dotenv.config({ path: path.join(root, ".env") });

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
}

main().catch((err) => {
  console.error("[sheet] Auto-update failed:", err);
  process.exit(1);
});
