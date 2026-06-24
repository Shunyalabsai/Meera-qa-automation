import { test, expect } from "@playwright/test";
import { openLanguagePanel } from "../../../../helpers/language-switcher.helper";
import {
  LANGUAGE_SAMPLES,
  LANGUAGE_SWITCHER_COPY,
  INTERNATIONAL_LANGUAGES,
  SOUTH_INDIA_LANGUAGES,
} from "../../../../data/language-switcher-data";

test.describe("Global › Language switcher — Search @language @positive", () => {
  test.beforeEach(async ({ page }) => {
    await openLanguagePanel(page);
  });

  test("TC-LG-030 @high @positive — Search Hindi filters to Hindi Belt option", async ({
    page,
  }) => {
    await page
      .getByPlaceholder(LANGUAGE_SWITCHER_COPY.searchPlaceholder)
      .fill(LANGUAGE_SAMPLES.searchHindi);
    await expect(page.locator(".lang-option").filter({ hasText: "Hindi" })).toBeVisible();
    await expect(page.locator(".lang-group-label")).not.toBeVisible();
  });

  test("TC-LG-031 @high @positive — Search Tamil shows only Tamil match", async ({
    page,
  }) => {
    await page.getByPlaceholder("Search language...").fill(LANGUAGE_SAMPLES.searchTamil);
    await expect(page.locator(".lang-option")).toHaveCount(1);
    await expect(page.locator(".lang-option")).toContainText("Tamil");
  });

  test("TC-LG-032 @medium @positive — Search Japanese finds international language", async ({
    page,
  }) => {
    await page
      .getByPlaceholder("Search language...")
      .fill(LANGUAGE_SAMPLES.searchJapanese);
    await expect(page.locator(".lang-option")).toHaveCount(1);
    await expect(page.locator(".lang-option")).toContainText("Japanese");
  });

  test("TC-LG-033 @medium @positive — Partial search Chinese matches both variants", async ({
    page,
  }) => {
    await page.getByPlaceholder("Search language...").fill(LANGUAGE_SAMPLES.searchPartial);
    await expect(page.locator(".lang-option")).toHaveCount(2);
    await expect(page.locator(".lang-option").first()).toContainText("Chinese");
  });

  test("TC-LG-034 @medium @positive — Clearing search restores all group headers", async ({
    page,
  }) => {
    const search = page.getByPlaceholder("Search language...");
    await search.fill(LANGUAGE_SAMPLES.searchHindi);
    await search.fill("");
    await expect(page.locator(".lang-group-label").first()).toBeVisible();
    await expect(page.locator(".lang-group-label")).toHaveCount(7);
  });

  test("TC-LG-035 @medium @positive — Search is case insensitive", async ({ page }) => {
    await page.getByPlaceholder("Search language...").fill("hindi");
    await expect(page.locator(".lang-option").filter({ hasText: "Hindi" })).toBeVisible();
  });

  test("TC-LG-036 @low @positive — Search input receives focus when panel opens", async ({
    page,
  }) => {
    await expect(page.getByPlaceholder("Search language...")).toBeFocused({
      timeout: 5_000,
    });
  });
});

test.describe("Global › Language switcher — Search negative @language @negative", () => {
  test("TC-LG-N101 @high @negative — Search with no match shows No results", async ({
    page,
  }) => {
    const switcher = await openLanguagePanel(page);
    await switcher.search(LANGUAGE_SAMPLES.searchNoMatch);
    await switcher.expectNoResults();
  });

  test("TC-LG-N102 @medium @negative — No results hides language options", async ({
    page,
  }) => {
    const switcher = await openLanguagePanel(page);
    await switcher.search(LANGUAGE_SAMPLES.searchNoMatch);
    await expect(switcher.dropdownPanel().locator(".lang-option")).toHaveCount(0);
  });

  test("TC-LG-N103 @medium @negative — Gibberish search does not change selected language", async ({
    page,
  }) => {
    const switcher = await openLanguagePanel(page);
    await switcher.search("!@#$%^&*()");
    await switcher.expectNoResults();
    await switcher.closeViaEscape();
    await switcher.expectTriggerShowsEnglish();
  });
});

test.describe("Global › Language switcher — Selection restore @language @positive", () => {
  test("TC-LG-040 @high @positive — Selecting English restores EN trigger after another language", async ({
    page,
  }) => {
    const switcher = await openLanguagePanel(page);
    await switcher.selectLanguage(SOUTH_INDIA_LANGUAGES[0]);
    await switcher.openPanel();
    await switcher.selectLanguage(INTERNATIONAL_LANGUAGES[0]);
    await switcher.expectTriggerShowsEnglish();
    await switcher.expectLocalStorageLang("en");
  });
});
