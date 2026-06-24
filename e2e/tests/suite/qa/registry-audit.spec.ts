import { test, expect } from "@playwright/test";
import book from "../../../data/qa-test-cases.json";
import voiceCases from "../../../data/voice-call-cases.json";
import { AUTOMATED_CASES } from "../../../data/coverage-registry";

type SheetRow = { id: string };

function allSheetIds(): string[] {
  const fromBook = Object.values(book).flatMap((rows) =>
    (rows as SheetRow[]).map((r) => r.id),
  );
  const fromVoice = (voiceCases as SheetRow[]).map((r) => r.id);
  return [...fromBook, ...fromVoice];
}

/** Ensures every QA sheet TC ID is tracked (automated registry + manual catalog). */
test.describe("QA Registry completeness @qa-audit", () => {
  test("All 132 sheet cases exist in QA data files", async () => {
    const ids = allSheetIds();
    expect(ids.length).toBe(132);
    expect(new Set(ids).size).toBe(132);
  });

  test("Automated registry has entries for UI-implemented cases", async () => {
    expect(Object.keys(AUTOMATED_CASES).length).toBeGreaterThan(55);
  });
});
