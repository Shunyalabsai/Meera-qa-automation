#!/usr/bin/env npx tsx
/**
 * Coverage report grouped by dashboard sidebar sections.
 * Run: npm run coverage:report
 */
import { getAllCases, caseCountByDashboardSection } from "../data/qa-cases.ts";
import { isAutomated, automatedCount } from "../data/coverage-registry.ts";
import { DASHBOARD_SECTIONS, dashboardLabel } from "../data/dashboard-sections.ts";

const all = getAllCases();
const counts = caseCountByDashboardSection();
const automated = all.filter((c) => isAutomated(c.id));

console.log("\nMeera VAP — QA Coverage (dashboard sections)\n");
console.log(`Total sheet cases:  ${all.length}`);
console.log(`Automated:          ${automated.length} (${automatedCount()} in registry)`);
console.log(`Catalog / manual:   ${all.length - automated.length}\n`);

console.log("By dashboard section:");
for (const dash of DASHBOARD_SECTIONS) {
  const total = counts[dash.id] ?? 0;
  if (!total) continue;
  const auto = all.filter(
    (c) => c.dashboardSection === dash.id && isAutomated(c.id),
  ).length;
  console.log(`  ${dashboardLabel(dash.id).padEnd(36)} ${String(auto).padStart(3)} / ${total}`);
}

console.log("\nAutomated TC IDs:");
for (const c of automated) {
  console.log(`  ${c.id} — ${c.name}`);
}
