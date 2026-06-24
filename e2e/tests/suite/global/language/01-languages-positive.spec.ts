import { test, expect } from "@playwright/test";
import { openLanguagePanel } from "../../../../helpers/language-switcher.helper";
import { E2E_LANGUAGE_STORAGE_KEY } from "../../../../data/test-fixtures";
import {
  INTERNATIONAL_LANGUAGES,
  HINDI_BELT_LANGUAGES,
  SOUTH_INDIA_LANGUAGES,
  WEST_INDIA_LANGUAGES,
  EAST_INDIA_LANGUAGES,
  NORTH_EAST_LANGUAGES,
  NORTH_INDIA_LANGUAGES,
} from "../../../../data/language-switcher-data";

test.describe("Global › Language switcher — International @language @positive", () => {
  test.beforeEach(async ({ page }) => {
    await openLanguagePanel(page);
  });

  for (const lang of INTERNATIONAL_LANGUAGES) {
    test(`TC-LG-INT-${lang.value} @medium @positive — ${lang.englishName} listed under International`, async ({
      page,
    }) => {
      const option = page
        .locator(".lang-dropdown .lang-option")
        .filter({ hasText: lang.englishName });
      await expect(option).toBeVisible();
    });
  }

  test("TC-LG-010 @high @positive — Selecting Japanese updates trigger and localStorage", async ({
    page,
  }) => {
    const japanese = INTERNATIONAL_LANGUAGES.find((l) => l.value === "ja")!;
    await page
      .locator(".lang-dropdown .lang-option")
      .filter({ hasText: japanese.englishName })
      .click();
    await expect(page.locator("button.lang-trigger")).toContainText("Japanese");
    await expect
      .poll(async () =>
        page.evaluate((key) => localStorage.getItem(key), E2E_LANGUAGE_STORAGE_KEY),
      )
      .toBe("ja");
  });

  test("TC-LG-011 @medium @positive — Selecting Arabic updates trigger label", async ({
    page,
  }) => {
    const arabic = INTERNATIONAL_LANGUAGES.find((l) => l.value === "ar")!;
    await page
      .locator(".lang-dropdown .lang-option")
      .filter({ hasText: arabic.englishName })
      .click();
    await expect(page.locator("button.lang-trigger")).toContainText("Arabic");
  });

  test("TC-LG-012 @medium @positive — Selecting French persists shunya_lang fr", async ({
    page,
  }) => {
    const french = INTERNATIONAL_LANGUAGES.find((l) => l.value === "fr")!;
    await page
      .locator(".lang-dropdown .lang-option")
      .filter({ hasText: french.englishName })
      .click();
    await expect
      .poll(async () =>
        page.evaluate((key) => localStorage.getItem(key), E2E_LANGUAGE_STORAGE_KEY),
      )
      .toBe("fr");
  });

  test("TC-LG-013 @low @positive @manual — Google Translate applies page translation", async () => {
    test.skip(true, "Manual: verify UI strings translate after non-English selection");
  });
});

test.describe("Global › Language switcher — Regional India @language @positive", () => {
  test.beforeEach(async ({ page }) => {
    await openLanguagePanel(page);
  });

  for (const lang of HINDI_BELT_LANGUAGES) {
    test(`TC-LG-HB-${lang.value} @medium @positive — ${lang.englishName} listed under Hindi Belt`, async ({
      page,
    }) => {
      await expect(
        page.locator(".lang-group-label", { hasText: "Hindi Belt" }),
      ).toBeVisible();
      await expect(
        page.locator(".lang-option").filter({ hasText: lang.englishName }),
      ).toBeVisible();
    });
  }

  for (const lang of SOUTH_INDIA_LANGUAGES) {
    test(`TC-LG-SI-${lang.value} @medium @positive — ${lang.englishName} listed under South India`, async ({
      page,
    }) => {
      await expect(
        page.locator(".lang-group-label", { hasText: "South India" }),
      ).toBeVisible();
      await expect(
        page.locator(".lang-option").filter({ hasText: lang.englishName }),
      ).toBeVisible();
    });
  }

  for (const lang of WEST_INDIA_LANGUAGES) {
    test(`TC-LG-WI-${lang.value} @medium @positive — ${lang.englishName} listed under West India`, async ({
      page,
    }) => {
      await expect(
        page.locator(".lang-group-label", { hasText: "West India" }),
      ).toBeVisible();
      await expect(
        page.locator(".lang-option").filter({ hasText: lang.englishName }),
      ).toBeVisible();
    });
  }

  for (const lang of EAST_INDIA_LANGUAGES) {
    test(`TC-LG-EI-${lang.value} @medium @positive — ${lang.englishName} listed under East India`, async ({
      page,
    }) => {
      await expect(
        page.locator(".lang-group-label", { hasText: "East India" }),
      ).toBeVisible();
      await expect(
        page.locator(".lang-option").filter({ hasText: lang.englishName }),
      ).toBeVisible();
    });
  }

  for (const lang of NORTH_EAST_LANGUAGES) {
    test(`TC-LG-NE-${lang.value} @medium @positive — ${lang.englishName} listed under North-East`, async ({
      page,
    }) => {
      await expect(
        page.locator(".lang-group-label", { hasText: "North-East" }),
      ).toBeVisible();
      await expect(
        page.locator(".lang-option").filter({ hasText: lang.englishName }),
      ).toBeVisible();
    });
  }

  for (const lang of NORTH_INDIA_LANGUAGES) {
    test(`TC-LG-NI-${lang.value} @medium @positive — ${lang.englishName} listed under North India`, async ({
      page,
    }) => {
      await expect(
        page.locator(".lang-group-label", { hasText: "North India" }),
      ).toBeVisible();
      await expect(
        page.locator(".lang-option").filter({ hasText: lang.englishName }),
      ).toBeVisible();
    });
  }

  test("TC-LG-020 @high @positive — Selecting Hindi updates trigger and localStorage hi", async ({
    page,
  }) => {
    const hindi = HINDI_BELT_LANGUAGES[0];
    await page
      .locator(".lang-option")
      .filter({ hasText: hindi.englishName })
      .click();
    await expect(page.locator("button.lang-trigger")).toContainText("हिन्दी");
    await expect
      .poll(async () =>
        page.evaluate((key) => localStorage.getItem(key), E2E_LANGUAGE_STORAGE_KEY),
      )
      .toBe("hi");
  });

  test("TC-LG-021 @medium @positive — Selecting Tamil stores ta in localStorage", async ({
    page,
  }) => {
    const tamil = SOUTH_INDIA_LANGUAGES[0];
    await page
      .locator(".lang-option")
      .filter({ hasText: tamil.englishName })
      .click();
    await expect
      .poll(async () =>
        page.evaluate((key) => localStorage.getItem(key), E2E_LANGUAGE_STORAGE_KEY),
      )
      .toBe("ta");
  });

  test("TC-LG-022 @medium @positive — Selecting Punjabi stores pa in localStorage", async ({
    page,
  }) => {
    const punjabi = NORTH_INDIA_LANGUAGES[0];
    await page
      .locator(".lang-option")
      .filter({ hasText: punjabi.englishName })
      .click();
    await expect
      .poll(async () =>
        page.evaluate((key) => localStorage.getItem(key), E2E_LANGUAGE_STORAGE_KEY),
      )
      .toBe("pa");
  });
});
