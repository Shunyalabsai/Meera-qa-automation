import { test, expect } from "@playwright/test";
import { openCallsList } from "../../../../../helpers/calls.helper";
import { skipUnlessHasCallRecords } from "../../../../../helpers/existing-user.helper";
import { reloadSpaRoute } from "../../../../../helpers/navigate";

test.describe("ANALYZE › Calls — Edge with data @journey @existing-user @calls @edge", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await skipUnlessHasCallRecords(page, testInfo);
  });

  test("TC-CL-EU-E101 @medium @edge — Combined filters keep page stable", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    await calls.selectFilterOption("State", "completed");
    await calls.selectFilterOption("Outcome", "resolved");
    await calls.selectFilterOption("Language", "en");
    await calls.expectPageHeader();
    await calls.expectEmptyOrTable();
  });

  test("TC-CL-EU-E102 @medium @edge — Navigate away and back preserves list", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    const count = await calls.parseShownCount();
    await page.getByRole("link", { name: /^Insights$/i }).click();
    await expect(page).toHaveURL(/\/insights/, { timeout: 30_000 });
    await page.getByRole("link", { name: /^Calls$/i }).click();
    await calls.expectPageHeader();
    expect(await calls.parseShownCount()).toBe(count);
  });

  test("TC-CL-EU-E103 @low @edge — Reload keeps filters and data", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    const count = await calls.parseShownCount();
    await reloadSpaRoute(page, "calls");
    await calls.expectPageHeader();
    expect(await calls.parseShownCount()).toBe(count);
  });
});
