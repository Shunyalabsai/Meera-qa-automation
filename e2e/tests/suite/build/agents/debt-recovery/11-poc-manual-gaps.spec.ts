import { test } from "@playwright/test";
import { openDebtRecoveryAgentForm } from "../../../../../helpers/agent.helper";

/**
 * Sheet cases that cannot be automated in the current POC UI.
 * Kept as explicit skips so coverage reports show they are tracked.
 */
test.describe("BUILD › Agents › Debt recovery — POC / manual gaps @debt-recovery @catalog", () => {
  test("TC-AG-003 @high @positive — STT model selection (hidden in POC UI)", async () => {
    test.skip(true, "STT provider dropdown hidden — Shunya Native handles STT end-to-end");
  });

  test("TC-AG-008 @high @positive — Enable/disable agent toggle", async ({ page }) => {
    await openDebtRecoveryAgentForm(page);
    const toggle = page.getByRole("switch", { name: /active|inactive/i });
    const hasToggle = await toggle.isVisible({ timeout: 3_000 }).catch(() => false);
    test.skip(!hasToggle, "No active/inactive toggle in current UI — status shown as badge only");
  });

  test("TC-AG-103 @high @negative — Save with no STT model selected", async () => {
    test.skip(true, "STT model picker not exposed in POC UI");
  });

  test("TC-AG-105 @high @negative — Delete agent mid live call", async () => {
    test.skip(true, "Requires live call in progress — manual / integration test");
  });

  test("TC-AG-201 @critical @security — Cross-org agent URL access", async () => {
    test.skip(true, "Requires two org accounts — security test suite");
  });

  test("TC-AG-202 @critical @security — System prompt injection via API", async () => {
    test.skip(true, "Requires API access — security test suite");
  });

  test("TC-AG-203 @high @security — Unauthorized agent modification via API", async () => {
    test.skip(true, "Requires scoped API key — security test suite");
  });
});
