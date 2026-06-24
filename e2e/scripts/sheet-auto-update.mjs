#!/usr/bin/env node
/**
 * Export + publish after a Playwright run (called from sheet-results.reporter).
 * Run manually: npm run sheet:update
 */
import { exportSheetResults } from "./export-results-sheet.mjs";
import { publishSheetResults } from "./publish-google-sheet.mjs";

async function main() {
  const exported = exportSheetResults({ log: true });
  if (!exported) {
    process.exit(1);
  }

  const published = await publishSheetResults({ log: true });
  if (!published) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("[sheet] Auto-update failed:", err);
  process.exit(1);
});
