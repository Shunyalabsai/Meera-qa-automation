/** ANALYZE › Recordings — copy and sample inputs from UI. */

export const RECORDINGS_COPY = {
  emptyTitle: /No recordings found/i,
  searchPlaceholder: /Search phone number or call ID/i,
  agentFilterDefault: /All agents/i,
} as const;

export const RECORDINGS_SAMPLES = {
  phoneNumber: "5551234567",
  e164Phone: "+15551234567",
  invalidSearch: "!!!not-a-real-query!!!",
  longSearch: "X".repeat(200),
} as const;
