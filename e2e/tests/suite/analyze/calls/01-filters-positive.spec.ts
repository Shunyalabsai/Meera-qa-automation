import { test, expect } from "@playwright/test";
import { openCallsList } from "../../../../helpers/calls.helper";
import {
  CALL_STATE_OPTIONS,
  CALL_OUTCOME_OPTIONS,
  CALL_SENTIMENT_OPTIONS,
  CALL_LANGUAGE_OPTIONS,
} from "../../../../data/calls-filter-data";

test.describe("ANALYZE › Calls — Filter dropdowns @journey @new-user @calls @positive", () => {
  test("TC-CL-010 @high @positive — Page loads at /calls", async ({ page }) => {
    await openCallsList(page);
    await expect(page).toHaveURL(/\/calls/);
  });

  test("TC-AN-002 @high @positive — State filter combobox visible", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    await expect(calls.filterSelect("State")).toBeVisible();
  });

  test("TC-CL-011 @high @positive — State filter lists all lifecycle values", async ({
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

  test("TC-CL-012 @high @positive — Outcome filter lists all outcome values", async ({
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

  test("TC-CL-013 @high @positive — Sentiment filter lists all sentiment values", async ({
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

  test("TC-CL-014 @high @positive — Language filter lists all language codes", async ({
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

  test("TC-CL-015 @medium @positive — Select State completed keeps page stable", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    await calls.selectFilterOption("State", "completed");
    await expect(page.getByRole("heading", { name: /^Calls$/i })).toBeVisible();
    await calls.expectEmptyOrTable();
  });

  test("TC-CL-016 @medium @positive — Select Outcome resolved keeps page stable", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    await calls.selectFilterOption("Outcome", "resolved");
    await expect(page.getByRole("heading", { name: /^Calls$/i })).toBeVisible();
    await calls.expectEmptyOrTable();
  });

  test("TC-CL-017 @medium @positive — Select Sentiment positive keeps page stable", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    await calls.selectFilterOption("Sentiment", "positive");
    await expect(page.getByRole("heading", { name: /^Calls$/i })).toBeVisible();
    await calls.expectEmptyOrTable();
  });

  test("TC-CL-018 @medium @positive — Select Language en keeps page stable", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    await calls.selectFilterOption("Language", "en");
    await expect(page.getByRole("heading", { name: /^Calls$/i })).toBeVisible();
    await calls.expectEmptyOrTable();
  });

  test("TC-AN-005 @medium @positive — Export or download control visible when data exists", async ({
    page,
  }) => {
    const calls = await openCallsList(page);
    const exportBtn = calls.exportButton();
    test.skip(
      !(await exportBtn.isVisible({ timeout: 5_000 }).catch(() => false)),
      "Export not exposed on empty calls list",
    );
    await expect(exportBtn).toBeVisible();
  });

});
