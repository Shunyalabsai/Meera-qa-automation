import { test, expect } from "@playwright/test";
import { openPlayground } from "../../../../helpers/playground.helper";

test.describe("BUILD › Playground — Main UI @journey @new-user @playground", () => {
  test("TC-PG-001 @smoke @high @ui — Playground header and subtitle visible", async ({
    page,
  }) => {
    const playground = await openPlayground(page);
    await playground.expectHeader();
  });

  test("TC-PG-002 @high @ui — Agent section with Pick an agent placeholder", async ({
    page,
  }) => {
    const playground = await openPlayground(page);
    await playground.expectAgentSection();
  });

  test("TC-PG-003 @high @ui — Browser and Phone Call mode toggle visible", async ({
    page,
  }) => {
    const playground = await openPlayground(page);
    await playground.expectModeToggle();
  });

  test("TC-PG-004 @high @ui — Log panel shows idle before any call", async ({
    page,
  }) => {
    const playground = await openPlayground(page);
    await playground.expectLogIdle();
  });

  test("TC-PG-005 @medium @ui — Sidebar Playground nav link visible", async ({
    page,
  }) => {
    await openPlayground(page);
    await expect(
      page.getByRole("link", { name: /^Playground$/i }),
    ).toBeVisible();
  });

  test("TC-PG-006 @high @positive — Full new-user playground layout", async ({
    page,
  }) => {
    const playground = await openPlayground(page);
    await playground.expectNewUserPlayground();
  });
});
