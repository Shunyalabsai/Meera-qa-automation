# Agent Template Cards — Dropdown Coverage

Shared Prompt-tab dropdown tests for **all 4 template cards** plus **Start from scratch**.

## Dropdown options (from UI)

| Field | Options |
|-------|---------|
| **Language** | `en`, `hi`, `hinglish`, `ta`, `te`, `bn`, `mr`, `gu` |
| **Voice tone** | `neutral`, `warm`, `professional`, `casual`, `assertive` |
| **Accent** | `neutral`, `indian`, `british`, `american`, `australian` |
| **Agent gender** | `neutral`, `female`, `male` |

## Template cards

1. Credit Card Payment Reminder
2. Order Confirmation & Reschedule
3. Appointment Reminder & Reschedule
4. Retention Call
5. Start from scratch

## Test files

| File | Coverage |
|------|----------|
| `templates/00-gallery.spec.ts` | Gallery UI + each card opens form |
| `templates/prompt-dropdowns.spec.ts` | All dropdown options × all 5 entries |

Each entry gets:
- 1 UI test (all 4 dropdowns list correct options)
- 8 Language selection tests
- 5 Voice tone tests
- 5 Accent tests
- 3 Agent gender tests
- 1 full exercise test

**Total per entry:** 23 tests × 5 entries = **115 dropdown tests**

Credit Card Payment Reminder–specific prompt tests (pre-fill, system prompt) remain in `credit-card-payment-reminder/01-prompt-tab.spec.ts`.

## Edge / negative cases

| File | Coverage |
|------|----------|
| `templates/edge-cases.spec.ts` | **All 5 entries × 22 edge cases** = 110 tests |
| `credit-card-payment-reminder/06-validation.spec.ts` | Lifecycle edges (delete/clone cancel) |

### Edge case matrix (per card)

| Category | Cases |
|----------|-------|
| **Name** | Empty, whitespace, 256 chars, 255 boundary, XSS, special chars, Unicode |
| **Prompt** | Empty system prompt |
| **Behaviour** | Empty first message, silence timeout 0/121, call duration 10/7201 |
| **Advanced** | Temp 5/-1, tokens 0/9000, pre-call no URL, bad URL, timeout 50ms |
| **Outcomes** | Bad JSON, JSON array, empty extraction allowed |

## Run

```bash
npm run auth:save
npm run test:agent-templates        # positive dropdowns + gallery
npm run test:agent-templates-edge   # all edge cases
```
