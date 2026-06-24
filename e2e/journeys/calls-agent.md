# ANALYZE › Calls — New User Journey

Search and filter completed call logs at `/calls`.

## Empty state (new user)

| Element | Text |
|---------|------|
| Title | Calls |
| Counter | 0 shown |
| Empty | No calls found |
| Hint | Try adjusting the filters. |
| Search | Search by Call ID → press Enter (Go button) |

## Filters

| Filter | Default | Options (from UI) |
|--------|---------|-------------------|
| Agent | Any | workspace agents |
| State | Any | initiated, dialing, ringing, connected, in_progress, ending, completed, failed, cancelled |
| Outcome | Any | resolved, callback_scheduled, escalated, no_answer, failed, busy, rejected, other |
| Sentiment | Any | positive, neutral, negative, angry |
| Language | Any | en, hi, hinglish, ta, te, bn, mr, gu |
| From number | — | e.g. 5551234 |
| To number | — | e.g. +1800 |
| Date from / to | dd/mm/yyyy | calendar picker |
| Duration (sec) | min / max | numeric |

## Test files

| File | Tag | Coverage |
|------|-----|----------|
| `00-main-ui.spec.ts` | `@ui` | Empty state, all filters visible |
| `01-filters-positive.spec.ts` | `@positive` | Dropdown options, TC-AN-002/003/005/007 |
| `02-search-positive.spec.ts` | `@positive` | Call ID search, phone/date/duration filters |
| `03-negative.spec.ts` | `@negative` | Invalid UUID, bad dates/duration, TC-AN-N101 |
| `04-edge.spec.ts` | `@edge` | Combined filters, nav, reload |
| `calls.spec.ts` | `@smoke` | TC-AN-001 page load |

## Manual (telephony / security)

- TC-AN-003 — View full transcript
- TC-AN-007 — Intent recognition on call detail
- TC-VC-009 — Recording saved after call
- TC-CL-E107 — Playground call → Calls list row
- TC-AN-201–203, TC-VC-201 — Security / PII

## Run

```bash
npm run auth:save
npm run test:calls
npm run test:calls -- --grep @negative
npm run test:calls -- --grep @edge
```
