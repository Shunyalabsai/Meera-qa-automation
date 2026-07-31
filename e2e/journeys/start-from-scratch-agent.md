# Start from Scratch — Full Journey

Test suite for the **Start from scratch** gallery entry (blank agent form, no template pre-fill).

## Gallery entry

Below the 4 template cards, **Start from scratch** opens a blank form with neutral defaults — user builds the agent entirely from scratch.

## Blank form defaults (from UI screenshots)

| Field | Default |
|-------|---------|
| Name | *(empty — required)* |
| Description | *(empty)* |
| Language | **en** |
| Voice tone | **neutral** |
| Accent | neutral |
| Agent gender | neutral |
| System prompt | *(empty — required)* |
| First message | *(empty)* |
| Pipeline | Shunya Native (selected) |
| Silence timeout | 10s · Max retries **2** · Max duration **1800s** |
| Speech speed | **1.00x** |
| Record all calls | unchecked |
| Temperature / tokens | 0.7 / 300 |
| Pre-call API | unchecked |

## Test files

| File | Coverage |
|------|----------|
| `00-template.spec.ts` | Gallery entry → blank form |
| `01-prompt-tab.spec.ts` | Empty fields, neutral defaults, custom prompt |
| `02-behaviour-tab.spec.ts` | Empty first message, silence, voicemail |
| `03-recording-tab.spec.ts` | Record all calls (unchecked default) |
| `04-outcomes-tab.spec.ts` | Platform defaults, custom extraction |
| `05-advanced-tab.spec.ts` | Temperature 0.7, pre-call API |
| `06-validation.spec.ts` | Delete/clone cancel |
| `07-full-journey.spec.ts` | Single-shot create from blank |
| `08-tabs-navigation.spec.ts` | All 5 tabs |
| `09-lifecycle.spec.ts` | Create → edit → clone → delete |

## Shared coverage

Also in `../templates/`:
- `00-gallery.spec.ts` — TC-AG-TPL-003 Start from scratch opens form
- `prompt-dropdowns.spec.ts` — all dropdown options (25 × 5 entries)
- `edge-cases.spec.ts` — 22 negative/edge cases per entry

## Run

```bash
npm run auth:save
npm run test:start-from-scratch
npm run test:start-from-scratch-lifecycle
```

## All 5 gallery entry points

| Entry | Folder | Tag |
|-------|--------|-----|
| Credit Card Payment Reminder | `credit-card-payment-reminder/` | `@credit-card-payment-reminder` |
| Order Confirmation & Reschedule | `order-confirmation-reschedule/` | `@order-confirmation-reschedule` |
| Appointment Reminder & Reschedule | `appointment-reminder-reschedule/` | `@appointment-reminder-reschedule` |
| Retention Call | `retention-call/` | `@retention-call` |
| **Start from scratch** | `start-from-scratch/` | `@start-from-scratch` |
