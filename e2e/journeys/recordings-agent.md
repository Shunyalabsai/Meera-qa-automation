# ANALYZE › Recordings — New User Journey

Browse and search call recordings at `/recordings`.

## Empty state (new user)

| Element | Text |
|---------|------|
| Title | Recordings |
| Search | Search phone number or call ID... |
| Agent filter | All agents |
| Empty | No recordings found. |

## Test files

| File | Tag | Coverage |
|------|-----|----------|
| `00-main-ui.spec.ts` | `@ui` | Empty state, search, agent filter, sidebar |
| `01-filters-positive.spec.ts` | `@positive` | Page load, All agents filter, TC-RC-002 |
| `02-search-positive.spec.ts` | `@positive` | Phone number, E.164, Call ID search |
| `03-negative.spec.ts` | `@negative` | Invalid UUID, nonsense search, XSS, bad route |
| `04-edge.spec.ts` | `@edge` | Combined filter+search, nav, reload, long query |
| `recordings.spec.ts` | `@smoke` | TC-RC-001 page load |

## Manual (telephony / security)

- TC-RC-012 — Agent filter lists workspace agents with recordings
- TC-RC-023 — Search returns matching recording row
- TC-RC-E107 — Recording appears after completed call
- TC-VC-202 — Recording URL without auth
- TC-SC-014 — Retention policy deletes recordings

## Run

```bash
npm run auth:save
npm run test:recordings
npm run test:recordings -- --grep @negative
npm run test:recordings -- --grep @edge
```
