/** Expected defaults when selecting the Credit Card Payment Reminder Agent (BFSI). */
// Maps from old "Debt recovery" template to new BFSI → Credit Card Payment Reminder Agent.

export const DEBT_RECOVERY_TEMPLATE = {
  cardTitle: "Debt recovery",
  cardDescription: /credit card payment|payment reminder|payment link/i,
  expectedName: /credit card/i,
  expectedLanguage: "en",
  expectedVoiceTone: "professional",
  expectedAccent: "american",
  expectedSystemPromptSnippet: /credit card payment|payment link|BFSI/i,
  expectedFirstMessageSnippet: /bank|credit|payment/i,
} as const;
