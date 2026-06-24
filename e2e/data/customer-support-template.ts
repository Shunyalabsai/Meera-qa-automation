/** Expected defaults when selecting the Customer support template card. */

export const CUSTOMER_SUPPORT_TEMPLATE = {
  cardTitle: "Customer support",
  cardDescription: /inbound support|understand issues|resolve/i,
  expectedName: /support/i,
  expectedLanguage: "en",
  expectedVoiceTone: "warm",
  expectedAccent: "neutral",
  expectedGender: "neutral",
  expectedSystemPromptSnippet: /customer support|empathetic|clarifying questions|escalate/i,
  expectedFirstMessageSnippet: /support|assist|help you today|brand/i,
  defaultFirstMessage:
    "Hi, thank you for reaching {{brand}} support. I'm here to help you today. What can I assist you with?",
  defaultSilenceTimeoutSecs: 10,
  defaultIdleMaxRetries: 2,
  defaultMaxCallDurationSecs: 1800,
  defaultExtractionFields: [
    "issueType",
    "issueResolved",
    "escalationNeeded",
    "satisfactionScore",
  ],
} as const;
