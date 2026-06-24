/** Expected defaults when selecting the Debt recovery template card. */

export const DEBT_RECOVERY_TEMPLATE = {
  cardTitle: "Debt recovery",
  cardDescription: /overdue payments|collect commitment/i,
  expectedName: /recovery/i,
  expectedLanguage: "hinglish",
  expectedVoiceTone: "assertive",
  expectedAccent: "neutral",
  expectedSystemPromptSnippet: /recovery|overdue|payment|commitment/i,
  expectedFirstMessageSnippet: /speaking with|account/i,
} as const;
