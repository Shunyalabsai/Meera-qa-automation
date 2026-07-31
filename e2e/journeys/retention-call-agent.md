# Customer Support Agent — Full Journey

Test suite for the **Retention Call** template card (inbound support).

## Template pre-fill (from UI screenshots)

| Field | Default |
|-------|---------|
| Name | Support Agent |
| Language | **en** |
| Voice tone | **warm** |
| Accent | **american** |
| Agent gender | **female** |
| First message | Retention-focused greeting (retention/cancellation) |
| Silence timeout | 10s · Max retries **2** · Max duration **1800s** |
| Voicemail detection | can be enabled |
| Temperature / tokens | 0.7 / 300 |

## System prompt (pre-filled)

> Retention-focused system prompt (retention/cancellation/customer) covering agent behavior for handling cancellations and retention conversations.

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
| `00-template.spec.ts` | Card + pre-fill |
| `01-prompt-tab.spec.ts` | en, warm, support system prompt |
| `02-behaviour-tab.spec.ts` | Support greeting, silence, voicemail, barge-in |
| `03-recording-tab.spec.ts` | Record all calls |
| `04-outcomes-tab.spec.ts` | resolved/escalated outcomes, issue extraction |
| `05-advanced-tab.spec.ts` | Temperature 0.7-0.9 for open support |
| `06-validation.spec.ts` | Delete/clone cancel |
| `07-full-journey.spec.ts` | Single-shot create |
| `08-tabs-navigation.spec.ts` | All 5 tabs |
| `09-lifecycle.spec.ts` | Create → edit → clone → delete |

## Shared coverage

Also in `../templates/`:
- `prompt-dropdowns.spec.ts` — all dropdown options
- `edge-cases.spec.ts` — 22 negative/edge cases per card

## Run

```bash
npm run auth:save
npm run test:retention-call
npm run test:retention-call-lifecycle
```

## All 4 template cards complete

| Card | Folder | Tag |
|------|--------|-----|
| Credit Card Payment Reminder | `credit-card-payment-reminder/` | `@credit-card-payment-reminder` |
| Order Confirmation & Reschedule | `order-confirmation-reschedule/` | `@order-confirmation-reschedule` |
| Appointment Reminder & Reschedule | `appointment-reminder-reschedule/` | `@appointment-reminder-reschedule` |
| Retention Call | `retention-call/` | `@retention-call` |
