import { Page } from "@playwright/test";
import { gotoApp } from "./navigate";
import { LanguageSwitcherPage } from "../pages/language-switcher.page";
import {
  E2E_DEFAULT_LANGUAGE,
  E2E_LANGUAGE_STORAGE_KEY,
} from "../data/test-fixtures";

async function seedDefaultLanguage(page: Page): Promise<void> {
  await page.addInitScript(
    ([key, value]) => {
      if (localStorage.getItem(key) == null) {
        localStorage.setItem(key, value);
      }
    },
    [E2E_LANGUAGE_STORAGE_KEY, E2E_DEFAULT_LANGUAGE] as const,
  );
}

export async function resetLanguagePreference(page: Page): Promise<void> {
  await page.evaluate(
    ([key, value]) => {
      localStorage.setItem(key, value);
    },
    [E2E_LANGUAGE_STORAGE_KEY, E2E_DEFAULT_LANGUAGE] as const,
  );
}

export async function openLanguageSwitcher(
  page: Page,
  route = "agents",
): Promise<LanguageSwitcherPage> {
  await seedDefaultLanguage(page);
  await gotoApp(page, route);
  const switcher = new LanguageSwitcherPage(page);
  await switcher.expectTriggerVisible();
  return switcher;
}

export async function openLanguagePanel(
  page: Page,
  route = "agents",
): Promise<LanguageSwitcherPage> {
  const switcher = await openLanguageSwitcher(page, route);
  await switcher.openPanel();
  return switcher;
}
