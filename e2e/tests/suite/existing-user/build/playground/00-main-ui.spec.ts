import { test, expect } from "@playwright/test";
import { openPlayground } from "../../../../../helpers/playground.helper";
import { skipUnlessHasSelectableAgent } from "../../../../../helpers/existing-user.helper";

test.describe("BUILD › Playground — Main UI @journey @existing-user @playground @ui", () => {
  test("TC-PG-EU-001 @high @ui — Playground header and subtitle visible", async ({
    page,
  }) => {
    const playground = await openPlayground(page);
    await playground.expectHeader();
  });

  test("TC-PG-EU-002 @high @ui — Agent picker visible", async ({ page }) => {
    const playground = await openPlayground(page);
    await expect(playground.agentSelect()).toBeVisible();
  });

  test("TC-PG-EU-003 @high @ui — Browser and Phone Call mode toggle visible", async ({
    page,
  }) => {
    const playground = await openPlayground(page);
    await playground.expectModeToggle();
  });

  test("TC-PG-EU-004 @high @ui — Log panel visible", async ({ page }) => {
    const playground = await openPlayground(page);
    await expect(playground.logPanel()).toBeVisible();
  });

  test("TC-PG-EU-005 @medium @ui — Sidebar Playground nav link visible", async ({
    page,
  }) => {
    await openPlayground(page);
    await expect(page.getByRole("link", { name: /^Playground$/i })).toBeVisible();
  });

  test("TC-PG-EU-006 @high @positive — Agent dropdown lists agents when workspace has agents", async ({
    page,
  }, testInfo) => {
    await skipUnlessHasSelectableAgent(page, testInfo);
    const playground = await openPlayground(page);
    expect(await playground.hasSelectableAgent()).toBe(true);
    const agentId = await playground.selectFirstAgent();
    expect(agentId).toBeTruthy();
  });
});
