/** Dropdown / select options from AgentForm.tsx — keep in sync with frontend. */

export const PIPELINE_OPTIONS = ["gemini_native"] as const;

export const LANGUAGE_OPTIONS = [
  "en",
  "hi",
  "hinglish",
  "ta",
  "te",
  "bn",
  "mr",
  "gu",
] as const;

export const VOICE_TONE_OPTIONS = [
  "neutral",
  "warm",
  "professional",
  "casual",
  "assertive",
] as const;

export const ACCENT_OPTIONS = [
  "neutral",
  "indian",
  "british",
  "american",
  "australian",
] as const;

export const AGENT_GENDER_OPTIONS = ["neutral", "female", "male"] as const;

export const CALL_DIRECTION_OPTIONS = ["outbound", "inbound"] as const;

export const PRE_CALL_API_METHODS = ["POST", "GET"] as const;

export type LanguageOption = (typeof LANGUAGE_OPTIONS)[number];
export type VoiceToneOption = (typeof VOICE_TONE_OPTIONS)[number];
export type AccentOption = (typeof ACCENT_OPTIONS)[number];
export type AgentGenderOption = (typeof AGENT_GENDER_OPTIONS)[number];
export type CallDirectionOption = (typeof CALL_DIRECTION_OPTIONS)[number];
