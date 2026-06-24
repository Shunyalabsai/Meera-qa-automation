/**
 * Edge / negative case catalog for agent create form.
 * Applied to every template card + Start from scratch.
 */

export const AGENT_FORM_EDGE_CASES = {
  name: {
    empty: { id: "NAME-EMPTY", sheet: "TC-AG-101", desc: "Empty name blocked" },
    whitespace: { id: "NAME-SPACE", sheet: null, desc: "Whitespace-only name blocked" },
    overLimit: { id: "NAME-256", sheet: "TC-AG-102", desc: "Name > 255 chars blocked" },
    boundary255: { id: "NAME-255", sheet: null, desc: "Name accepts exactly 255 chars" },
    xss: { id: "NAME-XSS", sheet: "TC-AG-106", desc: "XSS in name does not execute" },
    specialChars: { id: "NAME-SPECIAL", sheet: null, desc: "Special characters in name accepted" },
    unicode: { id: "NAME-UNICODE", sheet: null, desc: "Unicode (Hindi) name accepted" },
  },
  prompt: {
    emptySystemPrompt: {
      id: "PROMPT-EMPTY",
      sheet: null,
      desc: "Empty system prompt blocked when editable",
    },
  },
  behaviour: {
    emptyFirstMessage: {
      id: "GREET-EMPTY",
      sheet: null,
      desc: "Empty first message blocked",
    },
    silenceTimeoutZero: {
      id: "SILENCE-0",
      sheet: null,
      desc: "Silence timeout below minimum blocked",
    },
    silenceTimeoutOver: {
      id: "SILENCE-MAX",
      sheet: null,
      desc: "Silence timeout above 120 blocked",
    },
    callDurationUnder: {
      id: "DURATION-MIN",
      sheet: null,
      desc: "Max call duration below 30s blocked",
    },
    callDurationOver: {
      id: "DURATION-MAX",
      sheet: null,
      desc: "Max call duration above 7200s blocked",
    },
  },
  advanced: {
    temperatureHigh: { id: "TEMP-HIGH", sheet: "TC-AG-104", desc: "Temperature > 2.0 blocked" },
    temperatureLow: { id: "TEMP-LOW", sheet: null, desc: "Temperature below 0 blocked" },
    tokensZero: { id: "TOKENS-0", sheet: null, desc: "Max tokens below minimum blocked" },
    tokensOver: { id: "TOKENS-MAX", sheet: null, desc: "Max tokens above 8192 blocked" },
    preCallNoUrl: { id: "PRECALL-NOURL", sheet: null, desc: "Pre-call enabled without URL blocked" },
    preCallBadUrl: { id: "PRECALL-BADURL", sheet: null, desc: "Invalid pre-call URL blocked" },
    preCallTimeoutLow: {
      id: "PRECALL-TIMEOUT",
      sheet: null,
      desc: "Pre-call timeout below 100ms blocked",
    },
  },
  outcomes: {
    badJson: { id: "JSON-BAD", sheet: null, desc: "Malformed extraction JSON shows error" },
    jsonArray: { id: "JSON-ARRAY", sheet: null, desc: "Extraction JSON array rejected" },
    emptyExtraction: { id: "JSON-EMPTY", sheet: null, desc: "Empty extraction schema allowed" },
  },
} as const;

export function edgeCaseTestId(entryId: string, caseId: string): string {
  return `TC-AG-TPL-${entryId}-${caseId}`;
}
