import type {
  FullConfig,
  FullResult,
  Reporter,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

type SheetTestResult = {
  title: string;
  file: string;
  line: number;
  status: string;
  reason: string;
  durationMs: number;
  retry: number;
  /** Absolute path to the failure screenshot (image/png), when captured. */
  screenshot?: string;
};

type SheetResultsFile = {
  runAt: string;
  finishedAt: string;
  environment: string;
  runId: string;
  status: string;
  stats: {
    expected: number;
    unexpected: number;
    skipped: number;
    flaky: number;
    durationMs: number;
  };
  tests: SheetTestResult[];
};

function shouldAutoPublishSheet(): boolean {
  if (process.env.E2E_SHEET_AUTO_PUBLISH === "false") return false;
  if (process.env.CI && process.env.E2E_SHEET_AUTO_PUBLISH !== "true") {
    return false;
  }
  return true;
}

/** Captures pass / fail / skip + reason; auto-exports and publishes to Google Sheet. */
export default class SheetResultsReporter implements Reporter {
  /** Last retry wins — avoids flaky duplicate rows in the sheet. */
  private resultsByKey = new Map<string, SheetTestResult>();
  private runAt = "";
  private environment = "";
  private runId = "";

  onBegin(config: FullConfig): void {
    this.runAt = new Date().toISOString();
    this.environment =
      process.env.PLAYWRIGHT_BASE_URL ??
      config.projects[0]?.use?.baseURL?.toString() ??
      "";
    this.runId = this.runAt.replace(/[:.]/g, "-");
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    let reason = "";
    if (result.status === "failed" || result.status === "timedOut") {
      reason = result.error?.message ?? "Test failed";
    } else if (result.status === "skipped") {
      const skipAnnotation = test.annotations.find(
        (a) => a.type === "skip" || a.type === "reason" || a.type === "issue" || a.type === "note"
      );
      reason =
        result.error?.message ??
        skipAnnotation?.description ??
        (test.expectedStatus === "skipped" ? "Skipped by test configuration or tag filter" : "Skipped: Precondition not met during execution");
    } else if (result.status === "interrupted") {
      reason = result.error?.message ?? "Interrupted";
    }

    const file = path.relative(process.cwd(), test.location.file);
    const screenshot =
      result.attachments?.find((a) => a.contentType === "image/png" && a.path)?.path ??
      undefined;

    this.resultsByKey.set(test.id, {
      title: test.title,
      file,
      line: test.location.line,
      status: result.status,
      reason: reason.replace(/\s+/g, " ").trim().slice(0, 4000),
      durationMs: result.duration,
      retry: result.retry,
      screenshot,
    });
  }

  async onEnd(result: FullResult): Promise<void> {
    const entries = [...this.resultsByKey.values()];
    const outDir = path.join(process.cwd(), "test-results");
    fs.mkdirSync(outDir, { recursive: true });

    const flakyCount = entries.filter(
      (e) => e.retry > 0 && e.status === "passed",
    ).length;

    const payload: SheetResultsFile = {
      runAt: this.runAt,
      finishedAt: new Date().toISOString(),
      environment: this.environment,
      runId: this.runId,
      status: result.status,
      stats: {
        expected: entries.filter((e) => e.status === "passed").length,
        unexpected: entries.filter((e) =>
          ["failed", "timedOut", "interrupted"].includes(e.status),
        ).length,
        skipped: entries.filter((e) => e.status === "skipped").length,
        flaky: flakyCount,
        durationMs: result.duration,
      },
      tests: entries,
    };

    const outFile = path.join(outDir, "sheet-results.json");
    fs.writeFileSync(outFile, JSON.stringify(payload, null, 2));

    if (!shouldAutoPublishSheet()) return;
    if (entries.length === 0) return;
    if (result.status === "interrupted") {
      if (process.env.E2E_SHEET_PUBLISH_ON_INTERRUPT === "false") {
        console.log(
          "[sheet-results] Skipping auto-publish — run was interrupted",
        );
        return;
      }
      console.log(
        "[sheet-results] Run interrupted — publishing partial results from this run",
      );
    }

    await this.runAutoUpdate();
  }

  private runAutoUpdate(): Promise<void> {
    const script = path.join(process.cwd(), "e2e/scripts/sheet-auto-update.mjs");
    return new Promise((resolve) => {
      console.log("\n[sheet-results] Auto-updating Google Sheet from this run…");
      const child = spawn(process.execPath, [script], {
        cwd: process.cwd(),
        env: process.env,
        stdio: "inherit",
      });
      child.on("close", (code) => {
        if (code !== 0) {
          console.warn(
            `[sheet-results] Sheet auto-update exited with code ${code} — CSVs still at e2e/data/results-sheets/`,
          );
        }
        resolve();
      });
      child.on("error", (err) => {
        console.warn(`[sheet-results] Sheet auto-update failed: ${err.message}`);
        resolve();
      });
    });
  }
}
