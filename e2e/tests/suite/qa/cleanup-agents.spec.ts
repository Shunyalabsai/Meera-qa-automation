import { test, expect } from "@playwright/test";
import { AgentsListPage } from "../../../pages/agents-list.page";
import { gotoApp } from "../../../helpers/navigate";

/**
 * Maintenance: delete orphaned E2E-generated agents that accumulate on the shared
 * staging workspace. A saturated agent list (the app caps it at ~30) makes
 * agent-creation/clone/delete journeys flaky because freshly created agents can no
 * longer be reliably listed.
 *
 * Gated behind E2E_CLEANUP_AGENTS=true so it never runs in the normal suite.
 *   Run: npm run test:cleanup-agents
 *
 * Only deletes agents whose names are clearly test artifacts:
 *   - contain a 10+ digit timestamp (uniqueName uses Date.now())
 *   - end with "(copy)" (clones)
 *   - contain an XSS payload (<script>)
 *   - have an empty name (the product requires a name, so these are test-created)
 */
const RUN_CLEANUP = process.env.E2E_CLEANUP_AGENTS === "true";
const TEST_AGENT_PATTERN = /_\d{10,}|\(copy\)|<script>/i;

test.describe("QA › Maintenance — delete orphaned E2E agents @maintenance", () => {
  test.skip(!RUN_CLEANUP, "Set E2E_CLEANUP_AGENTS=true to run agent cleanup");
  test.describe.configure({ mode: "serial", timeout: 900_000 });

  test("Delete leftover test-generated agents", async ({ page }) => {
    const agents = new AgentsListPage(page);
    // Navigate without requiring a populated list — the workspace may be empty.
    await gotoApp(page, "agents");
    await expect(page.getByRole("heading", { name: "Agents" })).toBeVisible({
      timeout: 30_000,
    });

    let deleted = 0;
    for (let pass = 0; pass < 300; pass++) {
      const items = agents.agentListItems();
      const count = await items.count();
      let acted = false;

      for (let r = 0; r < count; r++) {
        const row = items.nth(r);
        const name =
          (
            await row
              .locator("span.font-medium")
              .first()
              .textContent()
              .catch(() => "")
          )?.trim() ?? "";

        const isTestArtifact = !name || TEST_AGENT_PATTERN.test(name);
        if (!isTestArtifact) continue;

        page.once("dialog", (d) => d.accept());
        try {
          await row.getByRole("button", { name: "Delete" }).click({ timeout: 10_000 });
          await expect
            .poll(async () => items.count(), { timeout: 15_000 })
            .toBeLessThan(count);
          deleted++;
          // eslint-disable-next-line no-console
          console.log(`Deleted: ${name || "(unnamed agent)"}`);
        } catch {
          // Row went stale or button not actionable — re-scan on next pass.
        }
        acted = true;
        break;
      }

      if (!acted) break;
    }

    // eslint-disable-next-line no-console
    console.log(`Cleanup complete — removed ${deleted} orphaned test agent(s).`);
  });
});
