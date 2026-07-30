import { test, expect } from "@playwright/test";
import { openCallsList } from "../../../../../helpers/calls.helper";
import { skipUnlessHasCallRecords } from "../../../../../helpers/existing-user.helper";
import { skipProductGap } from "../../../../../helpers/skip";
import {
  CALL_STATE_OPTIONS,
  CALL_OUTCOME_OPTIONS,
  CALL_SENTIMENT_OPTIONS,
  CALL_LANGUAGE_OPTIONS,
} from "../../../../../data/calls-filter-data";

test.describe("ANALYZE › Calls — Filter dropdowns with data @journey @existing-user @calls @positive", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await skipUnlessHasCallRecords(page, testInfo);
  });

  test("TC-CL-EU-010 @high @positive — Page loads at /calls", async ({ page }) => {
    await openCallsList(page);
    await expect(page).toHaveURL(/\/calls/);
  });

  test("TC-CL-EU-011 @high @positive — State filter lists all lifecycle values", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    const select = calls.filterSelect("State");
    test.skip(
      !(await select.isVisible({ timeout: 5_000 }).catch(() => false)),
      "State filter not a native select",
    );
    await calls.expectFilterOptions("State", CALL_STATE_OPTIONS);
  });

  test("TC-CL-EU-012 @high @positive — Outcome filter lists all outcome values", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    const select = calls.filterSelect("Outcome");
    test.skip(
      !(await select.isVisible({ timeout: 5_000 }).catch(() => false)),
      "Outcome filter not a native select",
    );
    await calls.expectFilterOptions("Outcome", CALL_OUTCOME_OPTIONS);
  });

  test("TC-CL-EU-013 @high @positive — Sentiment filter lists all sentiment values", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    const select = calls.filterSelect("Sentiment");
    test.skip(
      !(await select.isVisible({ timeout: 5_000 }).catch(() => false)),
      "Sentiment filter not a native select",
    );
    await calls.expectFilterOptions("Sentiment", CALL_SENTIMENT_OPTIONS);
  });

  test("TC-CL-EU-014 @high @positive — Language filter lists all language codes", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    const select = calls.filterSelect("Language");
    test.skip(
      !(await select.isVisible({ timeout: 5_000 }).catch(() => false)),
      "Language filter not a native select",
    );
    await calls.expectFilterOptions("Language", CALL_LANGUAGE_OPTIONS);
  });

  test("TC-CL-EU-015 @medium @positive — Export control visible with call data", async ({
    page,
  }, testInfo) => {
    const calls = await openCallsList(page);
    if (!(await calls.hasExportControl())) {
      skipProductGap(testInfo, "CL-EXPORT-001");
    }
    await expect(calls.exportButton()).toBeVisible();
  });

  test("TC-CL-EU-016 @medium @positive — Select State completed keeps page stable", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    await calls.selectFilterOption("State", "completed");
    await calls.expectPageHeader();
    await calls.expectEmptyOrTable();
  });

  test("TC-CL-EU-017 @medium @positive — Select Outcome resolved keeps page stable", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    await calls.selectFilterOption("Outcome", "resolved");
    await calls.expectPageHeader();
    await calls.expectEmptyOrTable();
  });

  test("TC-CL-EU-018 @medium @positive — Select Sentiment positive keeps page stable", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    await calls.selectFilterOption("Sentiment", "positive");
    await calls.expectPageHeader();
    await calls.expectEmptyOrTable();
  });

  test("TC-CL-EU-019 @medium @positive — Select Language en keeps page stable", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    await calls.selectFilterOption("Language", "en");
    await calls.expectPageHeader();
    await calls.expectEmptyOrTable();
  });
});
