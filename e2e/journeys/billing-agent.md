# SETTINGS › Billing — New User Journey

Usage and cost dashboard at `/billing`.

## Empty state (new user)

| Element | Value |
|---------|-------|
| Title | Billing |
| Subtitle | Usage and cost by provider. |
| Time range (dropdown) | **This month** — also Last 30 days, All time |
| KPI | TOTAL MINUTES **0.0** |
| Usage over time | day / **week** / month tabs (day default) |
| Empty (chart) | No usage recorded in the selected window. |
| Empty (detail) | No usage recorded in this period. |

## Test files

| File | Tag | Coverage |
|------|-----|----------|
| `00-main-ui.spec.ts` | `@ui` | Empty KPI, time range, interval tabs, sidebar |
| `01-filters-positive.spec.ts` | `@positive` | Time range options, day/week/month tabs |
| `03-negative.spec.ts` | `@negative` | Bad route, empty state across ranges |
| `04-edge.spec.ts` | `@edge` | Combined filters, nav, reload |
| `05-cta-functional.spec.ts` | `@cta` | Sidebar, dropdown, interval tabs |
| `billing.spec.ts` | `@smoke` | TC-BL-001 page load |

## Manual

- TC-BL-019 — TOTAL MINUTES updates after calls
- TC-BL-E106 — Usage chart populates after calls

## Run

```bash
npm run auth:save
npm run test:billing
npm run test:billing -- --grep @negative
npm run test:billing -- --grep @edge
npm run test:billing -- --grep @cta
```
