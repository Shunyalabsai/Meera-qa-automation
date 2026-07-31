/** Type declarations for known-issues.mjs (JS module — no emit). */

export type KnownIssueCategory =
  | "product-gap"
  | "staging-infra"
  | "untestable-ui"
  | "env-precondition";

export type KnownIssue = {
  category: KnownIssueCategory;
  summary: string;
  status?: string;
  alternative?: string;
  ticket?: string;
  fix?: string;
};

export declare const KNOWN_ISSUES: Record<string, KnownIssue>;
