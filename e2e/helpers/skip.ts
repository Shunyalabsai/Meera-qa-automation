import { test, type TestInfo } from "@playwright/test";
import { KNOWN_ISSUES } from "../data/known-issues.mjs";

export type KnownIssueId = keyof typeof KNOWN_ISSUES;

/** Build a standardized skip/fail reason string for reports and Google Sheet. */
export function issueReason(
  category: string,
  id: string,
  summary: string,
): string {
  return `[${category}:${id}] ${summary}`;
}

/** Skip with a registered known issue (product-gap, untestable-ui, etc.). */
export function skipKnownIssue(testInfo: TestInfo, id: KnownIssueId): void {
  const issue = KNOWN_ISSUES[id];
  if (!issue) {
    throw new Error(
      `Unknown issue "${String(id)}" — register it in e2e/data/known-issues.mjs`,
    );
  }
  testInfo.skip(
    true,
    issueReason(issue.category, String(id), issue.summary),
  );
}

/** Skip when workspace/env lacks required data (not a product bug). */
export function skipEnvPrecondition(testInfo: TestInfo, detail: string): void {
  testInfo.skip(true, `[env-precondition] ${detail}`);
}

/** Call when runtime proves a registered product-gap still exists. */
export function skipProductGap(
  testInfo: TestInfo,
  id: KnownIssueId,
  detail?: string,
): void {
  const issue = KNOWN_ISSUES[id];
  if (!issue || issue.category !== "product-gap") {
    throw new Error(
      `"${String(id)}" is not a registered product-gap in known-issues.mjs`,
    );
  }
  testInfo.skip(
    true,
    issueReason("product-gap", String(id), detail ?? issue.summary),
  );
}

/** Fail loudly when a product-gap was expected to be fixed. */
export function failProductGap(id: KnownIssueId, detail?: string): never {
  const issue = KNOWN_ISSUES[id];
  const msg = issue
    ? issueReason("product-gap", String(id), detail ?? issue.summary)
    : `[product-gap:${String(id)}] ${detail ?? "Product issue still present"}`;
  test.fail(true, msg);
  throw new Error(msg);
}
