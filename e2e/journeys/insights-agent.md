# ANALYZE › Insights — New User Journey

Analytics dashboard for call metrics at `/insights`.

## Empty state (new user)

| Element | Value |
|---------|-------|
| Title | Insights |
| Agent filter | All agents |
| Date presets (clickable tabs, top-right) | Last 7 days, **Last 30 days** (default active), Last 90 days, All time |
| Date range | dd/mm/yyyy from / to |
| KPIs | TOTAL CALLS 0, AVG DURATION 0s, COMPLETION RATE 0.0%, AVG EVAL SCORE —, TOTAL TURNS 0 |
| Charts | Calls Over Time, Outcome Distribution, Agent Performance, Sentiment Trends, Latency Trends, Hourly Call Heatmap |
| Campaign table | No campaign data for this period. |

## Test files

| File | Tag | Coverage |
|------|-----|----------|
| `00-main-ui.spec.ts` | `@ui` | Empty KPIs, charts, heatmap, campaign table, sidebar |
| `01-filters-positive.spec.ts` | `@positive` | Agent filter, date presets, TC-AN-004 |
| `02-widgets-positive.spec.ts` | `@positive` | KPI cards, chart legends, campaign headers |
| `03-negative.spec.ts` | `@negative` | Invalid dates, reversed range, bad route |
| `04-edge.spec.ts` | `@edge` | Combined filters, nav, reload, preset switching |
| `insights.spec.ts` | `@smoke` | TC-AN-004 page load |

## Manual (telephony / campaigns)

- TC-IS-017 — Sentiment chart populates after calls
- TC-IS-027 — KPIs update after completed calls
- TC-IS-E107 — Campaign Performance row after outbound campaign

## Run

```bash
npm run auth:save
npm run test:insights
npm run test:insights -- --grep @negative
npm run test:insights -- --grep @edge
```
