# Retention Call Agent — Full Journey

Test suite for the **Retention Call** template card (Telecom industry, outbound).

## Template pre-fill (from live UI)

| Field | Default |
|-------|---------|
| Card title | Retention Call |
| Name | <retention>-derived (asserted via regex) |
| Language | **en** |
| Voice tone | **warm** |
| Accent | **american** |
| Agent gender | **female** |
| Call direction | **outbound** |
| First message | `Hi, this is Sarah calling from ConnectTel regarding your recent request to cancel your mobile service. Am I speaking with ${customer_name}?` |
| Silence timeout | 10s · Max retries **2** · Max duration **600s** |
| Voicemail detection | can be enabled |
| Temperature / tokens | 0.7 / 300 |

## System prompt (pre-filled)

Retention-focused system prompt covering agent behavior for handling cancellations and retention conversations (`/retention|cancellation|customer/i`).

## Extraction fields (support-specific)

```json
{
  "issueType": "category of the customer's issue",
  "issueResolved": "boolean: was the issue fully resolved on the call?",
  "escalationNeeded": "boolean: did the call require human handoff?",
  "satisfactionScore": "integer 1-10 indicating customer satisfaction"
}
```

## Test files

| File | Coverage |
|------|----------|
| `00-template.spec.ts` | Card + pre-fill (incl. call-direction default), Change template → Telecom industry view |
| `01-prompt-tab.spec.ts` | en, warm, retention system prompt |
| `02-behaviour-tab.spec.ts` | Retention greeting, silence, voicemail, barge-in, max duration 600s |
| `03-recording-tab.spec.ts` | Record all calls |
| `04-outcomes-tab.spec.ts` | resolved/escalated outcomes, issue extraction fields |
| `05-advanced-tab.spec.ts` | Temperature 0.7-0.9 for open support |
| `06-validation.spec.ts` | Delete/clone cancel |
| `07-full-journey.spec.ts` | Single-shot create |
| `08-tabs-navigation.spec.ts` | All 5 tabs |
| `09-lifecycle.spec.ts` | Create → edit → clone → delete |

## Shared coverage

Also in `../templates/`:
- `prompt-dropdowns.spec.ts` — all dropdown options (Language, Voice tone, Accent, Gender, Call direction)
- `edge-cases.spec.ts` — 22 negative/edge cases per card

## Run

```bash
npm run auth:save
npm run test:retention-call
npm run test:retention-call-lifecycle
```

## All 4 template cards complete

| Card | Industry | Folder | Tag |
|------|----------|--------|-----|
| Credit Card Payment Reminder | BFSI | `credit-card-payment-reminder/` | `@credit-card-payment-reminder` |
| Order Confirmation & Reschedule | Logistics | `order-confirmation-reschedule/` | `@order-confirmation-reschedule` |
| Appointment Reminder & Reschedule | Healthcare | `appointment-reminder-reschedule/` | `@appointment-reminder-reschedule` |
| Retention Call | Telecom | `retention-call/` | `@retention-call` |
