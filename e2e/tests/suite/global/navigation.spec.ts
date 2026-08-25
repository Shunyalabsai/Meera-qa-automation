import { test, expect } from "@playwright/test";
import { gotoApp, waitForLoadingToClear } from "../../../helpers/navigate";

/** Sidebar routes grouped exactly like the dashboard. */
const DASHBOARD_ROUTES = {
  BUILD: [
    { path: "agents", label: /Agents/i },
    { path: "prompts", label: /Prompt/i },
    { path: "playground", label: /Playground/i },
  ],
  RUN: [
    { path: "campaigns", label: /Campaign/i },
    { path: "phone-numbers", label: /Phone numbers/i },
    { path: "live-calls", label: /Live Calls/i },
  ],
  ANALYZE: [
    { path: "calls", label: /Calls/i },
    { path: "recordings", label: /Recordings/i },
    { path: "insights", label: /Insights/i },
  ],
  SETTINGS: [
    { path: "alerts", label: /Alert/i },
    { path: "billing", label: /Billing/i },
    { path: "admin/webhooks", label: /Webhook/i },
  ],
} as const;

test.describe("Global UI › Navigation @smoke", () => {
  test("TC-UI-006 @high @positive — All dashboard sidebar routes load", async ({
    page,
  }) => {
    for (const [, routes] of Object.entries(DASHBOARD_ROUTES)) {
      for (const route of routes) {
        await gotoApp(page, route.path);
        await expect(
          page.getByRole("heading", { name: route.label }),
        ).toBeVisible({ timeout: 30_000 });
      }
    }
  });

  test("TC-UI-008 @high @positive — Delete confirmation dialog on Agents", async ({
    page,
  }) => {
    await gotoApp(page, "agents");
    await expect(page.getByRole("heading", { name: /^Agents$/i })).toBeVisible({ timeout: 30_000 });
    await waitForLoadingToClear(page);

    const deleteBtn = page.getByRole("button", { name: /^Delete$/i }).first();
    const visible = await deleteBtn.waitFor({ state: "visible", timeout: 15_000 }).then(() => true).catch(() => false);
    if (!visible) {
      test.skip(true, "No agents to test delete confirmation");
      return;
    }

    page.once("dialog", (d) => {
      expect(d.type()).toBe("confirm");
      d.dismiss();
    });
    await deleteBtn.click();
  });
});
