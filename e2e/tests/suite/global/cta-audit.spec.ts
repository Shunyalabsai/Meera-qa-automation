import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

/** Ensures every dashboard section has a dedicated @cta spec file. */
test.describe("Global — CTA spec audit @qa-audit @cta", () => {
  test("Each dashboard section has @cta spec file", async () => {
    const sections = [
      "build/agents",
      "build/prompts",
      "build/playground",
      "run/campaigns",
      "run/phone-numbers",
      "run/live-calls",
      "analyze/calls",
      "analyze/recordings",
      "analyze/insights",
      "settings/alerts",
      "settings/billing",
      "settings/webhooks",
    ];
    const suiteRoot = path.join(process.cwd(), "e2e/tests/suite");
    for (const section of sections) {
      const dir = path.join(suiteRoot, section);
      const files = fs.existsSync(dir)
        ? fs.readdirSync(dir).filter((f) => f.includes("cta"))
        : [];
      expect(files.length, `${section} missing *cta* spec`).toBeGreaterThan(0);
    }
  });
});
