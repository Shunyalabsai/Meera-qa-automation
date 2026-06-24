/** ANALYZE › Calls — filter options and copy from UI. */

export const CALL_STATE_OPTIONS = [
  "Any",
  "initiated",
  "dialing",
  "ringing",
  "connected",
  "in_progress",
  "ending",
  "completed",
  "failed",
  "cancelled",
] as const;

export const CALL_OUTCOME_OPTIONS = [
  "Any",
  "resolved",
  "callback_scheduled",
  "escalated",
  "no_answer",
  "failed",
  "busy",
  "rejected",
  "other",
] as const;

export const CALL_SENTIMENT_OPTIONS = [
  "Any",
  "positive",
  "neutral",
  "negative",
  "angry",
] as const;

export const CALL_LANGUAGE_OPTIONS = [
  "Any",
  "en",
  "hi",
  "hinglish",
  "ta",
  "te",
  "bn",
  "mr",
  "gu",
] as const;

export const CALLS_COPY = {
  emptyTitle: /No calls found/i,
  callSearchNoResult: /No calls found|Failed to load call/i,
  emptyHint: /Try adjusting the filters/i,
  shownCount: /\d+\s+shown/i,
  searchHint: /Search by Call ID/i,
  callIdPlaceholder: /call id|70b63568|78b63568/i,
} as const;

export const CALLS_FILTER_SAMPLES = {
  fromNumber: "5551234",
  toNumber: "+18005551234",
  minDuration: "30",
  maxDuration: "300",
  invalidCallId: "not-a-valid-uuid",
  futureDateFrom: "2099-01-01",
  futureDateTo: "2099-12-31",
} as const;

export type CallFilterLabel =
  | "Agent"
  | "State"
  | "Outcome"
  | "Sentiment"
  | "Language";
