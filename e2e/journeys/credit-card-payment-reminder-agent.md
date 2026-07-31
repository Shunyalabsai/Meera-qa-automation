# Credit Card Payment Reminder Agent — Full Journey

Test suite for the **Credit Card Payment Reminder** template card (BFSI industry, outbound).

## Template pre-fill (from live UI)

| Field | Default |
|-------|---------|
| Card title | Credit Card Payment Reminder |
| Name | <credit card>-derived (asserted via regex) |
| Language | **en** |
| Voice tone | **professional** |
| Accent | **american** |
| Agent gender | **female** |
| Call direction | **outbound** |
| First message | `Hi, this is Kate calling from Horizon Bank. Am I speaking with ${customer_name}?` |
| Silence timeout | 10s · Max retries **2** · Max duration **600s** |
| Voicemail detection | can be enabled |
| Temperature / tokens | 0.7 / 300 |

## System prompt (pre-filled)

Banking/BFSI system prompt covering overdue credit card payment follow-up and payment-link resend (`/credit card payment|payment link|BFSI/i`).

## Test files

| File | Coverage |
|------|----------|
| `00-template.spec.ts` | Card + pre-fill (incl. call-direction default), Change template → BFSI industry view |
| `01-prompt-tab.spec.ts` | en, professional, BFSI system prompt |
| `02-behaviour-tab.spec.ts` | Speech speed, voicemail, silence, barge-in |
| `03-recording-tab.spec.ts` | Record calls toggle |
| `04-outcomes-tab.spec.ts` | Outcomes, escalation / handoff |
| `05-advanced-tab.spec.ts` | Temperature, tokens, pre-call API (POST/GET) |
| `06-validation.spec.ts` | Empty name, >255 chars, XSS, invalid extraction JSON, invalid pre-call URL, min tokens, delete cancelled |
| `07-full-journey.spec.ts` | Single-shot create with all tabs filled |
| `08-tabs-navigation.spec.ts` | Tab order + Guide panel |
| `09-lifecycle.spec.ts` | Create → edit → clone → delete |

## Shared coverage

Also in `../templates/`:
- `prompt-dropdowns.spec.ts` — all dropdown options (Language, Voice tone, Accent, Gender, Call direction)
- `00-gallery.spec.ts` — 5 industry cards, per-industry agent counts, back navigation
- `edge-cases.spec.ts` — 22 negative/edge cases per card

## Run

```bash
npm run auth:save

# Full credit card suite
npm run test:credit-card-payment-reminder

# Lifecycle only (create → edit → clone → delete)
npx playwright test e2e/tests/suite/build/agents/credit-card-payment-reminder/09-lifecycle.spec.ts

# Positive tab tests
npx playwright test e2e/tests/suite/build/agents/credit-card-payment-reminder --grep @positive

# Negative validation
npx playwright test e2e/tests/suite/build/agents/credit-card-payment-reminder/06-validation.spec.ts
```
