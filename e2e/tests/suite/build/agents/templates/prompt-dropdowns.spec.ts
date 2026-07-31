import { test } from "@playwright/test";
import { openAgentFormForEntry } from "../../../../../helpers/agent.helper";
import { AgentFormPage } from "../../../../../pages/agent-form.page";
import { TEMPLATE_FORM_ENTRIES } from "../../../../../pages/agent-template.page";
import {
  ACCENT_OPTIONS,
  AGENT_GENDER_OPTIONS,
  CALL_DIRECTION_OPTIONS,
  LANGUAGE_OPTIONS,
  VOICE_TONE_OPTIONS,
} from "../../../../../data/agent-form-options";

/**
 * Prompt-tab dropdown matrix for every template card + Start from scratch.
 *
 * Language:    en, hi, hinglish, ta, te, bn, mr, gu
 * Voice tone:  neutral, warm, professional, casual, assertive
 * Accent:      neutral, indian, british, american, australian
 * Agent gender: neutral, female, male
 * Call direction: outbound, inbound
 */
for (const entry of TEMPLATE_FORM_ENTRIES) {
  test.describe(`BUILD › Agents › ${entry.label} — Prompt dropdowns @templates @positive`, () => {
    test.beforeEach(async ({ page }) => {
      const entryArg =
        entry.kind === "scratch"
          ? ({ kind: "scratch" as const })
          : ({ kind: "template" as const, title: entry.title! });

      await openAgentFormForEntry(page, entryArg);
    });

    test(`TC-AG-TPL-${entry.id}-UI @high @ui — All five dropdowns list correct options`, async ({
      page,
    }) => {
      const form = new AgentFormPage(page);
      await form.expectPromptTabContent();
      await form.expectAllPromptDropdownOptions();
    });

    test.describe("Language", () => {
      for (const lang of LANGUAGE_OPTIONS) {
        test(`TC-AG-TPL-${entry.id}-LANG-${lang} @medium — selects ${lang}`, async ({
          page,
        }) => {
          const form = new AgentFormPage(page);
          await form.selectLanguage(lang);
        });
      }
    });

    test.describe("Voice tone", () => {
      for (const tone of VOICE_TONE_OPTIONS) {
        test(`TC-AG-TPL-${entry.id}-TONE-${tone} @medium — selects ${tone}`, async ({
          page,
        }) => {
          const form = new AgentFormPage(page);
          await form.selectVoiceTone(tone);
        });
      }
    });

    test.describe("Accent", () => {
      for (const accent of ACCENT_OPTIONS) {
        test(`TC-AG-TPL-${entry.id}-ACCENT-${accent} @medium — selects ${accent}`, async ({
          page,
        }) => {
          const form = new AgentFormPage(page);
          await form.selectAccent(accent);
        });
      }
    });

    test.describe("Agent gender", () => {
      for (const gender of AGENT_GENDER_OPTIONS) {
        test(`TC-AG-TPL-${entry.id}-GENDER-${gender} @medium — selects ${gender}`, async ({
          page,
        }) => {
          const form = new AgentFormPage(page);
          await form.selectGender(gender);
        });
      }
    });

    test.describe("Call direction", () => {
      for (const dir of CALL_DIRECTION_OPTIONS) {
        test(`TC-AG-TPL-${entry.id}-DIR-${dir} @medium — selects ${dir}`, async ({
          page,
        }) => {
          const form = new AgentFormPage(page);
          await form.selectCallDirection(dir);
        });
      }
    });

    test(`TC-AG-TPL-${entry.id}-ALL @high @positive — Full dropdown exercise in one pass`, async ({
      page,
    }) => {
      const form = new AgentFormPage(page);
      await form.exerciseAllPromptDropdowns();
    });
  });
}
