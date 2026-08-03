import { test, expect } from "@playwright/test";
import { openLanguagePanel, openLanguageSwitcher } from "../../../../helpers/language-switcher.helper";
import { gotoApp, reloadSpaRoute } from "../../../../helpers/navigate";
import { SOUTH_INDIA_LANGUAGES } from "../../../../data/language-switcher-data";

test.describe("Global › Language switcher — Edge @language @edge", () => {
  test("TC-LG-E101 @medium @edge — Escape key closes language panel", async ({
    page,
  }) => {
    const switcher = await openLanguagePanel(page);
    await switcher.closeViaEscape();
  });

  test("TC-LG-E102 @medium @edge — Backdrop click closes language panel", async ({
    page,
  }) => {
    const switcher = await openLanguagePanel(page);
    await switcher.closeViaBackdrop();
  });

  test("TC-LG-E103 @medium @edge — Toggle trigger open close reopen", async ({
    page,
  }) => {
    const switcher = await openLanguageSwitcher(page);
    await switcher.openPanel();
    await switcher.closeViaEscape();
    await switcher.openPanel();
    await switcher.expectPanelOpen();
  });

  test("TC-LG-E104 @medium @edge — Selected language persists after sidebar navigation", async ({
    page,
  }) => {
    const switcher = await openLanguagePanel(page);
    await switcher.selectLanguage(SOUTH_INDIA_LANGUAGES[0]);
    await page.getByRole("link", { name: /^Billing$/i }).click();
    await expect(page).toHaveURL(/\/billing/, { timeout: 30_000 });
    await expect(page.locator("button.lang-trigger")).toContainText("தமிழ்");
  });

  test("TC-LG-E105 @medium @edge — Selected language survives page reload", async ({
    page,
  }) => {
    const switcher = await openLanguagePanel(page);
    const telugu = SOUTH_INDIA_LANGUAGES[1];
    await switcher.selectLanguage(telugu);
    await reloadSpaRoute(page, "agents");
    await switcher.expectTriggerShowsLanguage(/తెలుగు|Telugu/i);
    await switcher.expectLocalStorageLang(telugu.value);
  });

  test("TC-LG-E106 @low @edge — Language switcher visible on Webhooks route", async ({
    page,
  }) => {
    const switcher = await openLanguageSwitcher(page, "admin/webhooks");
    await switcher.openPanel();
    await expect(page.locator(".lang-dropdown")).toBeVisible();
  });

  test("TC-LG-E107 @medium @edge — Mobile viewport opens bottom sheet panel", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    // At 375px the sidebar (and its language trigger) collapses behind the
    // hamburger menu — open it, then use the trigger inside the drawer.
    await gotoApp(page, "agents");
    await page.getByRole("button", { name: /Open menu/i }).first().click();
    const trigger = page.locator("button.lang-trigger").filter({ visible: true }).first();
    await expect(trigger).toBeVisible({ timeout: 10_000 });
    await trigger.click();
    await expect(page.locator(".lang-dropdown--mobile")).toBeVisible();
  });

  test("TC-LG-E108 @low @edge — Language list scrolls when content exceeds panel height", async ({
    page,
  }) => {
    const switcher = await openLanguagePanel(page);
    const list = switcher.dropdownPanel().locator(".lang-list");
    await list.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    await expect(
      page.locator(".lang-option").filter({ hasText: "Sindhi" }),
    ).toBeVisible();
  });

  test("TC-LG-E109 @medium @edge — Switch Hindi then English resets trigger to EN", async ({
    page,
  }) => {
    const switcher = await openLanguagePanel(page);
    await switcher.selectLanguage({
      value: "hi",
      label: "हिन्दी — Hindi",
      englishName: "Hindi",
      group: "🇮🇳 Hindi Belt",
    });
    await switcher.openPanel();
    await switcher.selectLanguage({
      value: "en",
      label: "English",
      englishName: "English",
      group: "🌐 International",
    });
    await switcher.expectTriggerShowsEnglish();
    await switcher.expectLocalStorageLang("en");
  });

});
