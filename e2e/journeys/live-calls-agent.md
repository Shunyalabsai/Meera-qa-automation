# RUN › Live Calls — New User Journey

Real-time in-flight call monitoring at `/live-calls`.

## Empty state (new user)

| Element | Text |
|---------|------|
| Title | Live Calls |
| Subtitle | Calls currently in flight. Click any row to watch the conversation as it happens. |
| Empty | No calls in progress right now. |
| Hint | Start a call from **Playground**, or trigger one via **/api/calls** |

## Test files

| File | Tag | Coverage |
|------|-----|----------|
| `00-empty-state.spec.ts` | `@ui` | Empty state, TC-AN-006 |
| `01-positive.spec.ts` | `@positive` | Navigation, Playground link |
| `02-negative.spec.ts` | `@negative` | Invalid routes, reload |
| `03-edge.spec.ts` | `@edge` | Nav persistence, RUN siblings |
| `live-calls.spec.ts` | `@smoke` | Page load |

## Manual (live telephony)

- TC-VC-001 — Inbound call appears on dashboard
- TC-LC-E104 — Playground browser call → Live Calls row
- TC-LC-E105 — POST /api/calls → dashboard update

## Run

```bash
npm run auth:save
npm run test:live-calls
npm run test:live-calls -- --grep @negative
npm run test:live-calls -- --grep @edge
```
