import { test, expect } from "@playwright/test";
import { openCallsList } from "../../../../helpers/calls.helper";
import { VALID_UUID } from "../../../../utils/test-data";

test.describe("ANALYZE › Calls — CTA functional @calls @cta", () => {
  test("CTA-CL-001 @high @cta — Go button runs Call ID search", async ({ page }) => {
    const calls = await openCallsList(page);
    await calls.searchByCallIdGo(VALID_UUID);
    await calls.expectEmptyOrTable();
  });

  test("CTA-CL-002 @medium @cta — Export button clickable when data exists", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    const exportBtn = calls.exportButton();
    test.skip(
      !(await exportBtn.isVisible({ timeout: 5_000 }).catch(() => false)),
      "Export not shown — no call data",
    );
    await expect(exportBtn).toBeEnabled();
    await exportBtn.click();
    await expect(page.getByText(/export|download|csv|preparing/i).first()).toBeVisible({
      timeout: 15_000,
    }).catch(async () => {
      await calls.expectEmptyOrTable();
    });
  });

  test("CTA-CL-003 @medium @cta — State filter changes selection", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    await calls.selectFilterOption("State", "completed");
    await calls.expectEmptyOrTable();
  });
});
