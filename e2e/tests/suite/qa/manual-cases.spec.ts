import { test } from "@playwright/test";
import book from "../../../data/qa-test-cases.json";
import voiceCases from "../../../data/voice-call-cases.json";
import { isAutomated } from "../../../data/coverage-registry";
import { tagsForCase, priorityTag } from "../../../helpers/qa-case-tags";

type SheetRow = {
  id: string;
  name: string;
  preconditions: string;
  steps: string;
  expected: string;
  priority: string;
  type: string;
  section?: string;
};

function allSheetCases(): SheetRow[] {
  const fromBook = Object.entries(book).flatMap(([section, rows]) =>
    (rows as SheetRow[]).map((r) => ({ ...r, section })),
  );
  const fromVoice = (voiceCases as SheetRow[]).map((r) => ({
    ...r,
    section: "Voice Call / Telephony",
  }));
  return [...fromBook, ...fromVoice];
}

/**
 * Every QA sheet case not yet UI-automated is registered here as @manual
 * so the full 132-case matrix appears in `playwright test --list`.
 * Run: npm run test:manual
 */
for (const tc of allSheetCases()) {
  if (isAutomated(tc.id)) continue;

  const caseForTags = {
    ...tc,
    section: tc.section ?? "",
    dashboardSection: "",
  };
  const tags = `${tagsForCase(caseForTags)} ${priorityTag(caseForTags)} @catalog @qa-sheet`;
  test(`${tc.id} ${tags} — ${tc.name}`, async () => {
    test.skip(
      true,
      `[${tc.section}] Preconditions: ${tc.preconditions.slice(0, 120)} | Steps: ${tc.steps.slice(0, 200)} | Expected: ${tc.expected.slice(0, 120)}`,
    );
  });
}
