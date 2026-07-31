/** Expected defaults when selecting the Retention Call Agent (Telecom). */

export const RETENTION_CALL_TEMPLATE = {
  cardTitle: "Retention Call",
  cardDescription: /retention|cancellation|customer/i,
  expectedName: /retention/i,
  expectedLanguage: "en",
  expectedVoiceTone: "warm",
  expectedAccent: "american",
  expectedGender: "female",
  expectedSystemPromptSnippet: /retention|cancellation|customer/i,
  expectedFirstMessageSnippet: /retention|cancel/i,
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
