# SETTINGS › Alerts — New User Journey

Threshold rules and notification channels at `/alerts`.

## Empty state (new user)

| Element | Text |
|---------|------|
| Title | Alerts |
| Subtitle | Threshold rules that fire on call metrics. Events show in the call detail timeline. |
| Tabs | **Rules**, **Channels** |
| Rules empty | No alert rules yet. |
| Events empty | No alerts have fired yet. |
| Channels empty | No channels configured. Add a Slack webhook or an outbound webhook. |

## Create rule form (New rule)

| Field | Default / options |
|-------|-------------------|
| Name | (empty) |
| Metric | `duration_secs` — also eval_score, interruption_count, sentiment, outcome |
| Operator | `>` — also `<`, `<=`, `>=`, `==`, `!=` |
| Value | `60` |
| Severity | `warn` — also info, critical |
| Action | Create rule / Cancel |

## Add channel form (Channels tab → Add channel)

| Field | Default / options |
|-------|-------------------|
| Kind | `slack` — also webhook, email (stub) |
| Name | (empty) |
| URL | Slack webhook URL placeholder `https://hooks.slack.com/services/...` |
| Default channel | checkbox |
| Action | Save channel / Cancel |

## Test files

| File | Tag | Coverage |
|------|-----|----------|
| `00-main-ui.spec.ts` | `@ui` | Empty states, tabs, New rule button, sidebar |
| `01-rules-positive.spec.ts` | `@positive` | Create rule form fields, dropdowns, Cancel |
| `02-channels-positive.spec.ts` | `@positive` | Add channel form, Kind options, Cancel |
| `03-negative.spec.ts` | `@negative` | Missing name/value, invalid URL, bad route |
| `04-edge.spec.ts` | `@edge` | Tab switching, nav, reload, combined form edits |
| `alerts.spec.ts` | `@smoke` | TC-AL-001 page load |

## Manual

- TC-AL-021 — Create rule persists in Rules list
- TC-AL-038 — Save Slack channel persists
- TC-AL-E108 — Alert fires → Recent events

## Run

```bash
npm run auth:save
npm run test:alerts
npm run test:alerts -- --grep @negative
npm run test:alerts -- --grep @edge
```
