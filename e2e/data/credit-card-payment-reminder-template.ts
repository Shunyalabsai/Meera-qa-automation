/** Expected defaults when selecting the Credit Card Payment Reminder Agent (BFSI). */

export const CREDIT_CARD_PAYMENT_REMINDER_TEMPLATE = {
  cardTitle: "Credit Card Payment Reminder",
  cardDescription: /credit card payment|payment reminder|payment link/i,
  expectedName: /credit card/i,
  expectedLanguage: "en",
  expectedVoiceTone: "professional",
  expectedAccent: "american",
  expectedGender: "female",
  expectedSystemPromptSnippet: /credit card payment|payment link|BFSI/i,
  expectedFirstMessageSnippet: /bank|credit|payment/i,
  defaultFirstMessage:
    "Hi, this is Kate calling from Horizon Bank. Am I speaking with ${customer_name}?",
  defaultSilenceTimeoutSecs: 10,
  defaultIdleMaxRetries: 2,
  defaultMaxCallDurationSecs: 600,
  defaultCallDirection: "outbound",
} as const;
