import { test } from "@playwright/test";
import { openLanguagePanel } from "../../../../helpers/language-switcher.helper";

test.describe("Global › Language switcher @language", () => {
  test("TC-LG-S001 @high @positive — Language switcher opens and lists English", async ({
    page,
  }) => {
    const switcher = await openLanguagePanel(page);
    await switcher.expectActiveLanguage({
      value: "en",
      label: "English",
      englishName: "English",
      group: "🌐 International",
    });
  });
});
