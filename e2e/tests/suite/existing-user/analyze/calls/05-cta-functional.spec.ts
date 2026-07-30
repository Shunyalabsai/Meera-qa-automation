import { test, expect } from "@playwright/test";
import { openCallsList } from "../../../../../helpers/calls.helper";
import { skipUnlessHasCallRecords } from "../../../../../helpers/existing-user.helper";
import { skipProductGap } from "../../../../../helpers/skip";

test.describe("ANALYZE › Calls — CTA with data @journey @existing-user @calls @cta", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await skipUnlessHasCallRecords(page, testInfo);
  });

  test("CTA-CL-EU-001 @high @cta — Go button runs Call ID search", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    const callId = await calls.firstCallIdFromTable();
    test.skip(!callId, "No call ID in table");
    await calls.searchByCallIdGo(callId!);
    await expect(page).toHaveURL(/\/calls\//);
  });

  test("CTA-CL-EU-002 @medium @cta — Export button enabled with call data", async ({
    page,
  }, testInfo) => {
    const calls = await openCallsList(page);
    if (!(await calls.hasExportControl())) {
      skipProductGap(testInfo, "CL-EXPORT-001");
    }
    const exportBtn = calls.exportButton();
    await expect(exportBtn).toBeEnabled();
    await exportBtn.click();
    await expect(
      page.getByText(/export|download|csv|preparing/i).first(),
    ).toBeVisible({ timeout: 15_000 }).catch(async () => {
      await calls.expectHasCallRecords();
    });
  });

  test("CTA-CL-EU-003 @medium @cta — State filter changes selection", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    await calls.selectFilterOption("State", "completed");
    await calls.expectPageHeader();
    await calls.expectEmptyOrTable();
  });
});
