# Debt Recovery Agent — Full Journey

Complete test coverage for the **Debt recovery** template: all sheet TC-AG cases, every dropdown option, and the full agent lifecycle.

## Lifecycle (create → delete)

Serial spec: `09-lifecycle.spec.ts`

```
Create (TC-AG-001)
  → List verification
  → Detail page (TC-AG-DR-081)
  → Edit system prompt (TC-AG-002)
  → Edit first message (TC-AG-010)
  → Edit temperature/tokens (TC-AG-005)
  → Enable escalation (TC-AG-009)
  → Change language (TC-AG-004)
  → Clone (TC-AG-006)
  → Delete clone (TC-AG-007)
  → Delete original (TC-AG-007b)
```

## Positive cases (TC-AG-001 … 010)

| TC ID | Spec | What it tests |
|-------|------|---------------|
| TC-AG-001 | 09-lifecycle | Create debt recovery agent |
| TC-AG-002 | 09-lifecycle, 01-prompt-tab | Custom system prompt |
| TC-AG-003 | 11-poc-manual-gaps | STT model — **skipped** (POC UI hidden) |
| TC-AG-004 | 09-lifecycle, 01-prompt-tab | Language / TTS language |
| TC-AG-005 | 09-lifecycle, 05-advanced-tab | Temperature & max tokens |
| TC-AG-006 | 09-lifecycle | Clone agent |
| TC-AG-007 | 09-lifecycle | Delete agent |
| TC-AG-008 | 11-poc-manual-gaps | Active/inactive toggle — **skipped** if no UI |
| TC-AG-009 | 09-lifecycle, 04-outcomes-tab | Escalation / handoff |
| TC-AG-010 | 09-lifecycle, 02-behaviour-tab | First message / greeting |

## Negative cases (TC-AG-101 … 106)

| TC ID | Spec | What it tests |
|-------|------|---------------|
| TC-AG-101 | 06-validation | Empty name |
| TC-AG-102 | 06-validation | Name > 255 chars |
| TC-AG-103 | 11-poc-manual-gaps | No STT — **skipped** |
| TC-AG-104 | 06-validation | Temperature > 2.0 |
| TC-AG-105 | 11-poc-manual-gaps | Delete mid-call — **skipped** (manual) |
| TC-AG-106 | 06-validation | XSS in name |
| TC-AG-DR-N110 | 06-validation | Empty first message |
| TC-AG-DR-N111 | 06-validation | Invalid extraction JSON |
| TC-AG-DR-N112 | 06-validation | Invalid pre-call URL |
| TC-AG-DR-N113 | 06-validation | Max tokens below minimum |
| TC-AG-DR-N114 | 06-validation | Delete cancelled |

## Security (TC-AG-201 … 203)

Tracked in `11-poc-manual-gaps.spec.ts` as explicit skips — require multi-org or API access.

## Tab & dropdown coverage

| File | Coverage |
|------|----------|
| `../templates/prompt-dropdowns.spec.ts` | **All 4 cards + scratch** — Language (8), Voice tone (5), Accent (5), Gender (3) |
| `../templates/00-gallery.spec.ts` | Template gallery cards |
| 00-template | Debt recovery card pre-fill |
| 02-behaviour-tab | Speech speed, voicemail, silence, barge-in |
| 03-recording-tab | Record calls toggle |
| 04-outcomes-tab | Outcomes, extraction JSON, escalation |
| 05-advanced-tab | Temperature, tokens, pre-call API (POST/GET) |
| 07-full-journey | Single-shot create with all tabs filled |
| 08-tabs-navigation | Tab order + Guide panel |

## Run

```bash
npm run auth:save

# Full debt recovery suite (~70 tests)
npm run test:debt-recovery

# Lifecycle only (create → edit → clone → delete)
npx playwright test e2e/tests/suite/build/agents/debt-recovery/09-lifecycle.spec.ts

# Positive tab tests
npx playwright test e2e/tests/suite/build/agents/debt-recovery --grep @positive

# Negative validation
npx playwright test e2e/tests/suite/build/agents/debt-recovery/06-validation.spec.ts
```
