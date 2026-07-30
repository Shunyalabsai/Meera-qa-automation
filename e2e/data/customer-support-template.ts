/** Expected defaults when selecting the Retention Call Agent (Telecom). */
// Maps from old "Customer support" template to new Telecom → Retention Call Agent.

export const CUSTOMER_SUPPORT_TEMPLATE = {
  cardTitle: "Customer support",
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
