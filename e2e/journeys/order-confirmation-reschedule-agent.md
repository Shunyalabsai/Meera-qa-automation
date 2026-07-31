# Order Confirmation & Reschedule Agent — Full Journey

Test suite for the **Order Confirmation & Reschedule** template card (Logistics industry, outbound).

## Template pre-fill (from live UI)

| Field | Default |
|-------|---------|
| Card title | Order Confirmation & Reschedule |
| Name | <order confirmation>-derived (asserted via regex) |
| Language | **hinglish** |
| Voice tone | **professional** |
| Accent | **indian** |
| Agent gender | **female** |
| Call direction | **outbound** |
| First message | `Hi! Kya main ${customer_name} ji se baat kar rahi hoon?` (Hinglish) |
| Silence timeout | 10s · Max retries **2** · Max duration **600s** |
| Voicemail detection | can be enabled |
| Temperature / tokens | 0.7 / 300 |

## System prompt (pre-filled)

Logistics order-confirmation system prompt covering confirming delivery details and rescheduling (`/order|confirms|reschedule|Logistics/i`).

## Extraction fields (order-specific)

```json
{
  "buyingIntent": "confirmed intent to buy",
  "orderConfirmed": "boolean: order details confirmed on the call",
  "updatedAddress": "revised delivery address if provided"
}
```

## Test files

| File | Coverage |
|------|----------|
| `00-template.spec.ts` | Card + pre-fill (incl. call-direction default), Change template → Logistics industry view |
| `01-prompt-tab.spec.ts` | Pipeline, system prompt, basic info |
| `02-behaviour-tab.spec.ts` | First message, silence, barge-in, voicemail |
| `03-recording-tab.spec.ts` | Record all calls toggle |
| `04-outcomes-tab.spec.ts` | Outcomes, orderConfirmed extraction, escalation |
| `05-advanced-tab.spec.ts` | Temperature, tokens, pre-call API |
| `06-validation.spec.ts` | Delete/clone cancel edge cases |
| `07-full-journey.spec.ts` | Single-shot create with all tabs |
| `08-tabs-navigation.spec.ts` | Tab order + Guide panel |
| `09-lifecycle.spec.ts` | Create → edit → clone → delete (serial) |

## Shared coverage (all cards)

Dropdown matrix and edge cases for Order Confirmation & Reschedule also run in:

- `../templates/prompt-dropdowns.spec.ts` (@templates @positive)
- `../templates/edge-cases.spec.ts` (@templates @negative @edge)

## Run

```bash
npm run auth:save
npm run test:order-confirmation-reschedule
npm run test:order-confirmation-reschedule-lifecycle
```
