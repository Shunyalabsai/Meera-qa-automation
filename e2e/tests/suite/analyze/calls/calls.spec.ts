import { test, expect } from "@playwright/test";
import { CallsListPage } from "../../../../pages/calls-list.page";

test.describe("ANALYZE › Calls @smoke @calls", () => {
  test("TC-AN-001 @high @positive — View call logs", async ({ page }) => {
    const calls = new CallsListPage(page);
    await calls.open();
    await expect(calls.filterSelect("State")).toBeVisible();
    await calls.expectEmptyOrTable();
  });
});
