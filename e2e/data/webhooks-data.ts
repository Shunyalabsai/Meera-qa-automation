/** SETTINGS › Webhooks — copy, events, and stable test inputs. */
import {
  E2E_CUSTOM_EVENT_TYPE,
  E2E_HTTPS_URL,
  E2E_INTERNAL_IP_URL,
  E2E_INVALID_URL,
  E2E_SHORT_SECRET,
  E2E_WEBHOOK_SECRET,
  E2E_WEBHOOK_SECRET_MIN_LENGTH,
} from "./test-fixtures";

/** Matches UI copy: Shared secret (≥ 16 chars). Validation is silent — no alert toast. */
export const WEBHOOK_SECRET_MIN_LENGTH = E2E_WEBHOOK_SECRET_MIN_LENGTH;

export const WEBHOOKS_COPY = {
  subtitle: /Per-event outbound delivery configuration/i,
  quickApplyTitle: /Quick apply/i,
  quickApplyHint: /One URL \+ one secret|subscribe any events below/i,
  eventSubscriptions: /Event subscriptions/i,
  customEventTitle: /Custom event type/i,
  customEventHint: /events not in the known list/i,
  recentDeliveries: /Recent deliveries/i,
  noDeliveries: /No deliveries yet/i,
  notSubscribed: /not subscribed/i,
  subscribed: /subscribed/i,
  selectedCount: /\d+\s+selected.*\d+\s+will be created/i,
} as const;

export const WEBHOOK_EVENTS = [
  "call.triggered",
  "call.connected",
  "call.completed",
  "call.failed",
  "intent.captured",
  "transfer.initiated",
] as const;

export const WEBHOOKS_SAMPLES = {
  validUrl: E2E_HTTPS_URL,
  invalidUrl: E2E_INVALID_URL,
  validSecret: E2E_WEBHOOK_SECRET,
  shortSecret: E2E_SHORT_SECRET,
  customEventType: E2E_CUSTOM_EVENT_TYPE,
  internalIpUrl: E2E_INTERNAL_IP_URL,
} as const;
