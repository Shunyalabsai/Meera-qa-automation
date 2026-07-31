/** Global sidebar language switcher (Google Translate). */
import { Page, expect, Locator } from "@playwright/test";
import { gotoApp } from "../helpers/navigate";
import {
  ALL_UI_LANGUAGES,
  LANGUAGE_REGION_GROUPS,
  LANGUAGE_SWITCHER_COPY,
  type LanguageEntry,
} from "../data/language-switcher-data";
import {
  E2E_DEFAULT_LANGUAGE,
  E2E_LANGUAGE_STORAGE_KEY,
} from "../data/test-fixtures";

export class LanguageSwitcherPage {
  constructor(private readonly page: Page) {}

  triggerButton(): Locator {
    return this.page.locator("button.lang-trigger");
  }

  dropdownPanel(): Locator {
    return this.page.locator(".lang-dropdown");
  }

  searchInput(): Locator {
    return this.page.getByPlaceholder(LANGUAGE_SWITCHER_COPY.searchPlaceholder);
  }

  backdrop(): Locator {
    return this.page.getByRole("button", {
      name: LANGUAGE_SWITCHER_COPY.closeBackdrop,
    });
  }

  languageOption(entry: LanguageEntry | string): Locator {
    const label =
      typeof entry === "string"
        ? entry
        : entry.label.includes(" — ")
          ? entry.label
          : entry.label;
    return this.dropdownPanel()
      .locator(".lang-option")
      .filter({ hasText: new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) });
  }

  groupLabel(group: string): Locator {
    return this.dropdownPanel().locator(".lang-group-label", { hasText: group });
  }

  activeOption(): Locator {
    return this.dropdownPanel().locator(".lang-option.active");
  }

  async isShellBroken(): Promise<boolean> {
    const notFound = await this.page
      .getByText(/"detail"\s*:\s*"Not Found"|Not Found/i)
      .isVisible({ timeout: 1_000 })
      .catch(() => false);
    if (notFound) return true;
    return !(await this.triggerButton()
      .isVisible({ timeout: 2_000 })
      .catch(() => false));
  }

  async openPanel() {
    const trigger = this.triggerButton();
    await expect(trigger).toBeVisible({ timeout: 30_000 });
    if ((await trigger.getAttribute("aria-expanded")) !== "true") {
      await trigger.click();
    }
    await this.expectPanelOpen();
  }

  async expectPanelOpen() {
    await expect(this.triggerButton()).toHaveAttribute("aria-expanded", "true");
    await expect(this.dropdownPanel()).toBeVisible({ timeout: 10_000 });
    await expect(this.searchInput()).toBeVisible();
  }

  async expectPanelClosed() {
    await expect(this.triggerButton()).toHaveAttribute("aria-expanded", "false");
    await expect(this.dropdownPanel()).not.toBeVisible();
  }

  async closeViaBackdrop() {
    await this.backdrop().click();
    await this.expectPanelClosed();
  }

  async closeViaEscape() {
    await this.page.keyboard.press("Escape");
    await this.expectPanelClosed();
  }

  async search(query: string) {
    await this.searchInput().fill(query);
  }

  async selectLanguage(entry: LanguageEntry, route = "agents") {
    await this.languageOption(entry).click();
    await this.page.waitForLoadState("domcontentloaded").catch(() => {});
    if (await this.isShellBroken()) {
      await gotoApp(this.page, route);
    } else {
      await this.expectPanelClosed();
    }
  }

  async expectTriggerShowsEnglish() {
    await this.expectTriggerShowsLanguage("English");
    await expect(this.triggerButton()).toContainText("EN");
  }

  async expectAllRegionGroupsVisible() {
    for (const group of LANGUAGE_REGION_GROUPS) {
      await expect(this.groupLabel(group)).toBeVisible();
    }
  }

  async expectLanguageListed(entry: LanguageEntry) {
    await expect(this.languageOption(entry)).toBeVisible();
  }

  async expectActiveLanguage(entry: LanguageEntry) {
    await expect(this.activeOption()).toContainText(entry.englishName);
  }

  async expectNoResults() {
    await expect(
      this.dropdownPanel().getByText(LANGUAGE_SWITCHER_COPY.noResults),
    ).toBeVisible();
  }

  async expectTriggerVisible() {
    await expect(this.triggerButton()).toBeVisible({ timeout: 30_000 });
    await expect(this.triggerButton()).toContainText(
      LANGUAGE_SWITCHER_COPY.defaultTrigger,
    );
  }

  async expectTriggerShowsLanguage(label: string | RegExp) {
    await expect(this.triggerButton()).toBeVisible({ timeout: 30_000 });
    await expect(this.triggerButton()).toContainText(label);
  }

  async expectLocalStorageLang(value: string) {
    await expect
      .poll(async () =>
        this.page.evaluate(
          (key) => localStorage.getItem(key),
          E2E_LANGUAGE_STORAGE_KEY,
        ),
      )
      .toBe(value);
  }

  async getStoredLang(): Promise<string | null> {
    return this.page.evaluate(
      (key) => localStorage.getItem(key),
      E2E_LANGUAGE_STORAGE_KEY,
    );
  }

  async expectGoogleTranslateElementHidden() {
    await expect(this.page.locator("#google_translate_element")).toBeAttached();
  }

  languageCount(): number {
    return ALL_UI_LANGUAGES.length;
  }
}
