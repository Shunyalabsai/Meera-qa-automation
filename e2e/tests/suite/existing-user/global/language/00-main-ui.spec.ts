import { test, expect } from "@playwright/test";
import { openLanguagePanel, openLanguageSwitcher } from "../../../../../helpers/language-switcher.helper";
import {
  LANGUAGE_REGION_GROUPS,
  LANGUAGE_SWITCHER_COPY,
  INTERNATIONAL_LANGUAGES,
} from "../../../../../data/language-switcher-data";

test.describe("Global › Language switcher — Main UI @journey @existing-user @language", () => {
  test("TC-LG-001 @high @ui — Language trigger visible in sidebar with English EN", async ({
    page,
  }) => {
    const switcher = await openLanguageSwitcher(page);
    await switcher.expectTriggerShowsEnglish();
  });

  test("TC-LG-002 @high @ui — Opening trigger shows search and listbox panel", async ({
    page,
  }) => {
    const switcher = await openLanguagePanel(page);
    await expect(
      page.getByRole("listbox", { name: LANGUAGE_SWITCHER_COPY.listboxLabel }),
    ).toBeVisible();
    await expect(switcher.searchInput()).toHaveAttribute(
      "placeholder",
      LANGUAGE_SWITCHER_COPY.searchPlaceholder,
    );
  });

  test("TC-LG-003 @high @ui — All seven group headers visible including International", async ({
    page,
  }) => {
    const switcher = await openLanguagePanel(page);
    await switcher.expectAllRegionGroupsVisible();
    expect(LANGUAGE_REGION_GROUPS.length).toBe(7);
  });

  test("TC-LG-004 @high @ui — English shown as active with checkmark in panel", async ({
    page,
  }) => {
    const switcher = await openLanguagePanel(page);
    await switcher.expectActiveLanguage(INTERNATIONAL_LANGUAGES[0]);
    await expect(switcher.activeOption().locator("svg")).toBeVisible();
  });

  test("TC-LG-005 @medium @ui — International section lists all 14 languages", async ({
    page,
  }) => {
    const switcher = await openLanguagePanel(page);
    for (const lang of INTERNATIONAL_LANGUAGES) {
      await switcher.expectLanguageListed(lang);
    }
  });

  test("TC-LG-006 @medium @ui — Google Translate element present but hidden", async ({
    page,
  }) => {
    const switcher = await openLanguageSwitcher(page);
    await switcher.expectGoogleTranslateElementHidden();
  });

  test("TC-LG-007 @medium @ui — Trigger shows flag icon and chevron", async ({
    page,
  }) => {
    const switcher = await openLanguageSwitcher(page);
    // The trigger shows a flag emoji + chevron (single svg) — the old globe
    // icon + chevron pair was replaced.
    await expect(switcher.triggerButton().locator("svg")).toHaveCount(1);
  });

  test("TC-LG-008 @medium @ui — Language panel scrollable list container visible", async ({
    page,
  }) => {
    const switcher = await openLanguagePanel(page);
    await expect(switcher.dropdownPanel().locator(".lang-list")).toBeVisible();
  });
});
