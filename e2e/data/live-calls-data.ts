/** Copy and routes for RUN › Live Calls. */

export const LIVE_CALLS_COPY = {
  emptyTitle: /No calls in progress right now/i,
  emptyHint: /Start a call from Playground|trigger one via \/api\/calls/i,
  subtitle: /Calls currently in flight|Click any row to watch/i,
  playgroundHint: /Playground/i,
  apiHint: /\/api\/calls/i,
} as const;
