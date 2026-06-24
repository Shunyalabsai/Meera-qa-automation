# SETTINGS › Webhooks — New User Journey

Per-event outbound delivery configuration at `/admin/webhooks`.

## Empty state (new user)

| Element | Text / state |
|---------|----------------|
| Title | Webhooks |
| Subtitle | Per-event outbound delivery configuration. Each event can point at its own URL — or use the quick-apply below… |
| Quick apply | Webhook URL, Shared secret (≥ 16 chars), Select all / Clear, event checkboxes, **Apply to N events** |
| Event subscriptions | Each event: name, **not subscribed** badge, description, **Subscribe** |
| Custom event | Link: **+ Subscribe to a custom event type** → Event Type, URL, Secret, **Create** / **Cancel** |
| Recent deliveries | **No deliveries yet.** |

## Standard events

- `call.triggered` — call row created (before audio)
- `call.connected` — state → CONNECTED
- `call.completed` — post-call extraction (summary, outcome, sentiment)
- `call.failed` — state → FAILED
- `intent.captured` — customer intent non-null after extraction
- `transfer.initiated` — operator marks transfer to human queue

## Per-event subscribe form (Subscribe click)

| Field | Required |
|-------|----------|
| URL | Yes (`https://your-app/webhook`) |
| Secret (≥ 16 chars) | Yes |
| Save subscription | Submit |
| Cancel | Collapse form |

## Custom event type form

| Field | Placeholder |
|-------|-------------|
| Event Type | `campaign.exhausted` |
| URL | `https://your-app/webhook` |
| Secret | `secret (>= 16 chars)` |

## Test files

| File | Tag | Coverage |
|------|-----|----------|
| `00-main-ui.spec.ts` | `@ui` | Empty state, quick apply, events, deliveries, custom link |
| `01-quick-apply-positive.spec.ts` | `@positive` | URL/secret, Select all/Clear, Apply, selection count |
| `02-subscriptions-positive.spec.ts` | `@positive` | Subscribe form, Save/Cancel, custom event Create/Cancel |
| `03-negative.spec.ts` | `@negative` | Invalid URL, short secret, empty fields, bad route |
| `04-edge.spec.ts` | `@edge` | Nav, reload, select/clear, form switching |
| `05-cta-functional.spec.ts` | `@cta` | All primary CTAs |
| `webhooks.spec.ts` | `@smoke` | TC-IN-001 page load |

## Manual

- TC-IN-002 — CRM webhook on call end
- TC-IN-003 — Zapier/n8n integration
- TC-IN-005 — API key revocation (if exposed)
- TC-WH-E109 — Save subscription → Recent deliveries updates
- TC-IN-201–204 — Security (HMAC, SSRF, API key scope)

## Run

```bash
npm run auth:save
npm run test:webhooks
npm run test:webhooks -- --grep @negative
npm run test:webhooks -- --grep @edge
npm run test:webhooks -- --grep @cta
```
