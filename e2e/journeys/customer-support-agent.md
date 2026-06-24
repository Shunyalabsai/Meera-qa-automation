# Customer Support Agent — Full Journey

Test suite for the **Customer support** template card (inbound support).

## Template pre-fill (from UI screenshots)

| Field | Default |
|-------|---------|
| Name | Support Agent |
| Language | **en** |
| Voice tone | **warm** |
| Accent | neutral |
| Agent gender | neutral |
| First message | Hi, thank you for reaching {{brand}} support. I'm here to help you today... |
| Silence timeout | 10s · Max retries **2** · Max duration **1800s** |
| Voicemail detection | can be enabled |
| Temperature / tokens | 0.7 / 300 |

## System prompt (pre-filled)

> You are a helpful customer support agent. Your goal is to understand the customer's issue and resolve it efficiently. Be empathetic and patient. Ask clarifying questions before suggesting solutions. Escalate to a human if the issue is complex.

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
npm run test:customer-support
npm run test:customer-support-lifecycle
```

## All 4 template cards complete

| Card | Folder | Tag |
|------|--------|-----|
| Debt recovery | `debt-recovery/` | `@debt-recovery` |
| Order confirmation | `order-confirmation/` | `@order-confirmation` |
| Appointment reminder | `appointment-reminder/` | `@appointment-reminder` |
| Customer support | `customer-support/` | `@customer-support` |
