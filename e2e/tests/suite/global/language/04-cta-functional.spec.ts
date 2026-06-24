import { test, expect } from "@playwright/test";
import { openLanguageSwitcher, openLanguagePanel } from "../../../../helpers/language-switcher.helper";
import {
  INTERNATIONAL_LANGUAGES,
  SOUTH_INDIA_LANGUAGES,
  LANGUAGE_SAMPLES,
} from "../../../../data/language-switcher-data";

test.describe("Global › Language switcher — CTA functional @language @cta", () => {
  test("CTA-LG-001 @high @cta — Language trigger opens dropdown panel", async ({
    page,
  }) => {
    const switcher = await openLanguageSwitcher(page);
    await switcher.openPanel();
    await expect(switcher.dropdownPanel()).toBeVisible();
  });

  test("CTA-LG-002 @high @cta — Search input filters language list", async ({
    page,
  }) => {
    const switcher = await openLanguagePanel(page);
    await switcher.search(LANGUAGE_SAMPLES.searchTamil);
    await expect(switcher.dropdownPanel().locator(".lang-option")).toHaveCount(1);
  });

  test("CTA-LG-003 @high @cta — Language option click selects and closes panel", async ({
    page,
  }) => {
    const switcher = await openLanguagePanel(page);
    await switcher.selectLanguage(INTERNATIONAL_LANGUAGES.find((l) => l.value === "de")!);
    await switcher.expectPanelClosed();
    await expect(page.locator("button.lang-trigger")).toContainText("German");
  });

  test("CTA-LG-004 @medium @cta — Backdrop button closes panel", async ({ page }) => {
    const switcher = await openLanguagePanel(page);
    await switcher.closeViaBackdrop();
  });

  test("CTA-LG-005 @medium @cta — Escape closes panel without changing language", async ({
    page,
  }) => {
    const switcher = await openLanguagePanel(page);
    await switcher.closeViaEscape();
    await switcher.expectTriggerShowsEnglish();
  });

  test("CTA-LG-006 @medium @cta — Re-open trigger after selection shows new active option", async ({
    page,
  }) => {
    const switcher = await openLanguagePanel(page);
    const kannada = SOUTH_INDIA_LANGUAGES[2];
    await switcher.selectLanguage(kannada);
    await switcher.openPanel();
    await switcher.expectActiveLanguage(kannada);
  });

  test("CTA-LG-007 @medium @cta — Trigger chevron rotates when expanded", async ({
    page,
  }) => {
    const switcher = await openLanguageSwitcher(page);
    await switcher.openPanel();
    await expect(switcher.triggerButton()).toHaveAttribute("aria-expanded", "true");
  });
});
