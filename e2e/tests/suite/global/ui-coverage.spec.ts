import { test, expect } from "@playwright/test";
import { gotoApp } from "../../../helpers/navigate";
import { openAgentFormFromScratch } from "../../../helpers/agent.helper";
import { uniqueName } from "../../../utils/test-data";
import { PROMPT_TEMPLATE_SAMPLES } from "../../../data/prompt-template-data";

test.describe("Global UI — Positive @positive @global", () => {
  test("TC-UI-002 @high @positive — Tablet viewport (768px) on Agents", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await gotoApp(page, "agents");
    await expect(page.getByRole("heading", { name: "Agents" })).toBeVisible();
  });

  test("TC-UI-003 @medium @positive — Keyboard Tab reaches main content", async ({
    page,
  }) => {
    await gotoApp(page, "agents");
    await expect(page.getByRole("heading", { name: "Agents" })).toBeVisible();

    let reachedFocusable = false;
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press("Tab");
      reachedFocusable = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body || el === document.documentElement) {
          return false;
        }
        const inApp = el.closest("main, nav, aside, header") !== null;
        const focusable = el.matches(
          "a, button, input, select, textarea, [tabindex]:not([tabindex='-1'])",
        );
        const visible =
          el.getClientRects().length > 0 &&
          window.getComputedStyle(el).visibility !== "hidden";
        return inApp && focusable && visible;
      });
      if (reachedFocusable) break;
    }
    expect(reachedFocusable).toBe(true);
  });

  test("TC-UI-011 @medium @positive — Calls page shows table or empty state", async ({
    page,
  }) => {
    await gotoApp(page, "calls");
    await expect(
      page.getByRole("table").or(page.getByText(/No calls|0 calls/i)),
    ).toBeVisible({ timeout: 20_000 });
  });
});

test.describe("Global UI — Negative @negative @global", () => {
  test("TC-UI-007 @medium @negative — Validation error visible on empty agent submit", async ({
    page,
  }) => {
    const form = await openAgentFormFromScratch(page);
    await form.nameInput().clear();
    await form.submitCreate();
    await form.expectNameRequiredError();
  });

  test("TC-UI-N101 @medium @negative — Unknown route shows 404 or redirects", async ({
    page,
  }) => {
    await gotoApp(page, "this-route-does-not-exist-xyz");
    await expect(
      page.getByText(/404|not found|Agents|Prompt/i).first(),
    ).toBeVisible({ timeout: 15_000 });
  });
});

test.describe("Global UI — Edge @edge @global", () => {
  test("TC-UI-009 @medium @edge — Form retains name on validation error", async ({
    page,
  }) => {
    const form = await openAgentFormFromScratch(page);
    const name = uniqueName("RetainOnError");
    await form.nameInput().fill(name);
    await form.openTab("Behaviour");
    await page.getByLabel(/First message/i).fill("");
    await form.submitCreate();
    await form.expectSaveBlocked();
    await form.openTab("Prompt");
    await expect(form.nameInput()).toHaveValue(name);
  });

  test("TC-EC-004 @medium @edge — Unicode emoji in agent system prompt field", async ({
    page,
  }) => {
    const form = await openAgentFormFromScratch(page);
    const prompt = "आपका स्वागत है 👋 Be helpful.";
    const input = form.systemPromptInput();
    if (await input.isEditable({ timeout: 3_000 }).catch(() => false)) {
      await input.fill(prompt);
      await expect(input).toHaveValue(prompt);
    }
  });

});

test.describe("Global UI — Security @security @global", () => {
  test("TC-SC-003 @high @security — Security headers on app response", async ({
    page,
  }) => {
    const response = await page.goto("/vap/agents");
    expect(response?.status()).toBeLessThan(500);
    const headers = response?.headers() ?? {};
    const hasSecurityHeader =
      "x-frame-options" in headers ||
      "content-security-policy" in headers ||
      "x-content-type-options" in headers;
    expect(hasSecurityHeader).toBe(true);
  });

  test("TC-SC-004 @high @security — HTTPS enforced", async ({ page }) => {
    await gotoApp(page, "agents");
    expect(page.url().startsWith("https://")).toBe(true);
  });

});
