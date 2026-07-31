/** Expected defaults when choosing Start from scratch on the template gallery. */

export const START_FROM_SCRATCH = {
  galleryLabel: "Start from scratch",
  galleryHint: /create with your own|blank|from scratch/i,
  expectedLanguage: "en",
  expectedVoiceTone: "neutral",
  expectedAccent: "neutral",
  expectedGender: "neutral",
  defaultSilenceTimeoutSecs: 10,
  defaultIdleMaxRetries: 2,
  defaultMaxCallDurationSecs: 1800,
  defaultCallDirection: "outbound",
  defaultTemperature: 0.7,
  defaultMaxTokens: 300,
  defaultSpeechSpeed: /1(\.0+)?/,
  sampleSystemPrompt:
    "You are a voice agent. Be clear, concise, and helpful. Follow the caller's lead and confirm key details before ending the call.",
  sampleFirstMessage:
    "Hi {{customerName}}, this is calling from {{brand}}. How can I help you today?",
  sampleDescription: "Custom outbound agent built from scratch for E2E testing",
  sampleExtractionSchema: `{
  "intentCaptured": "primary reason for the call",
  "issueResolved": "boolean: was the caller's request fulfilled?"
}`,
} as const;
