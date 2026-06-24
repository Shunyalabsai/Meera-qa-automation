#!/usr/bin/env node
/**
 * Validates skip reasons reference registered ids and lists open product gaps.
 * Run: npm run issues:audit
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { KNOWN_ISSUES, STAGING_INFRA } from "../data/known-issues.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const suiteDir = path.join(root, "e2e/tests/suite");

const idPattern = /\[(product-gap|staging-infra|untestable-ui|env-precondition|manual):([A-Z0-9-]+)\]/g;

/** @type {Map<string, string[]>} */
const referenced = new Map();
/** @type {string[]} */
const unknownIds = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".spec.ts")) {
      const text = fs.readFileSync(full, "utf8");
      for (const match of text.matchAll(idPattern)) {
        const [, category, id] = match;
        const key = `${category}:${id}`;
        if (!referenced.has(key)) referenced.set(key, []);
        referenced.get(key).push(path.relative(root, full));
        if (
          category !== "env-precondition" &&
          category !== "manual" &&
          !KNOWN_ISSUES[id] &&
          !STAGING_INFRA[id]
        ) {
          unknownIds.push(`${key} in ${path.relative(root, full)}`);
        }
      }
    }
  }
}

walk(suiteDir);

console.log("=== Open product gaps (known-issues.mjs) ===");
for (const [id, issue] of Object.entries(KNOWN_ISSUES)) {
  if (issue.category === "product-gap" && issue.status === "open") {
    const refs = [...referenced.entries()]
      .filter(([k]) => k.endsWith(`:${id}`))
      .flatMap(([, files]) => files);
    console.log(`  ${id}: ${issue.summary}`);
    console.log(`    referenced in: ${refs.length ? refs.join(", ") : "(not yet wired — test may still fail)"}`);
  }
}

console.log("\n=== Staging infra (documented, not product bugs) ===");
for (const [id, info] of Object.entries(STAGING_INFRA)) {
  console.log(`  ${id}: ${info.summary}`);
}

if (unknownIds.length) {
  console.error("\n=== Unknown issue ids in specs (add to known-issues.mjs) ===");
  for (const u of unknownIds) console.error(`  ${u}`);
  process.exit(1);
}

console.log("\nAudit OK — all tagged issue ids are registered.");
