# Order Confirmation Agent — Full Journey

Test suite for the **Order confirmation** template card, mirroring the Debt recovery structure.

## Template pre-fill (from UI)

| Field | Default |
|-------|---------|
| Name | Order Confirmation Agent |
| Language | hinglish |
| Voice tone | warm |
| Accent | neutral |
| Agent gender | neutral |
| First message | Hi {{customerName}}, I'm calling to confirm your recent order with {{brand}}... |
| Extraction JSON | buyingIntent, orderConfirmed, updatedAddress |
| Temperature | 0.7 |
| Max tokens | 300 |

## Test files

| File | Coverage |
|------|----------|
| `00-template.spec.ts` | Card selection, pre-fill verification |
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

Dropdown matrix and edge cases for Order confirmation also run in:

- `../templates/prompt-dropdowns.spec.ts` (@templates @positive)
- `../templates/edge-cases.spec.ts` (@templates @negative @edge)

## Run

```bash
npm run auth:save
npm run test:order-confirmation
npm run test:order-confirmation-lifecycle
```
