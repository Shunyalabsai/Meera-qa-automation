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
    "Hi, this is Sarah calling from ConnectTel regarding your recent request to cancel your mobile service. Am I speaking with ${customer_name}?",
  defaultSilenceTimeoutSecs: 10,
  defaultIdleMaxRetries: 2,
  defaultMaxCallDurationSecs: 600,
  defaultCallDirection: "outbound",
  defaultExtractionFields: [
    "issueType",
    "issueResolved",
    "escalationNeeded",
    "satisfactionScore",
  ],
} as const;
