# Existing User Journey

Full returning-user coverage mirroring `@new-user` — every section, positive / negative / edge / CTA.

## Stats

- **~391 tests** in **83 spec files** under `e2e/tests/suite/existing-user/`
- Run: `E2E_USE_SAVED_AUTH=true npm run test:existing-user`

## Design rules

- **`@existing-user`** on every spec
- **No hardcoded counts** — reads live UI at runtime
- **Honest skips** — `[env-precondition]` when staging lacks data (not fake Pass)
- **Form/UI tests** (New rule, New template, Add number modal) run even on empty workspace — returning users can always create

## Section coverage

| Section | Files | Notes |
|---------|-------|-------|
| Authentication | session | Saved SSO across BUILD/ANALYZE/SETTINGS |
| BUILD › Agents | list UI, positive, negative, edge, **list-detail CTAs** | Populated CTAs use first agent in list |
| BUILD › Prompts | create form, variables, validation, lifecycle, edge, CTA, populated list | Full mirror of `@new-user` |
| BUILD › Playground | main UI, browser/phone mode, negative, edge, CTA | Requires agents in dropdown |
| RUN › Campaigns | create form, phone link, negative, edge, CTA, populated list | |
| RUN › Phone numbers | modal, negative, edge, CTA, populated list | Modal works with or without numbers |
| RUN › Live Calls | positive, negative, edge, CTA, populated rows | |
| ANALYZE › Calls | main UI, filters, search, negative, edge, CTA | Verified with staging call data |
| ANALYZE › Recordings | filters, search, negative, edge, CTA, populated UI | |
| ANALYZE › Insights | main UI, filters, widgets, negative, edge, CTA | Verified with staging KPIs |
| SETTINGS › Alerts | rules form, channels form, negative, edge, CTA, populated rules | |
| SETTINGS › Billing | usage UI, filters, negative, edge, CTA | Verified with usage minutes |
| SETTINGS › Webhooks | main UI, quick apply, subscriptions, negative, edge, CTA | |
| Global › Language | main UI, languages, search, edge, CTA | Same for all users |
| Workspace | personal workspace, user menu | |

## Staging profile

| Has data | Sections that run populated tests |
|----------|-----------------------------------|
| Yes | Calls, Insights, Billing (current staging) |
| Empty → skip | Agents, Campaigns, Phone numbers, Alerts, Webhooks, Recordings (until data exists) |
| Always runs | Forms, CTAs, navigation, language, auth session |

## Not duplicated here (already exist without `@new-user`)

- **Agent template tab journeys** (~183 tests) — create-from-gallery; use `@journey` specs under `build/agents/*/`
- **Manual / telephony / security** — remain `@manual` in both journeys

## Commands

```bash
npm run auth:save
E2E_USE_SAVED_AUTH=true npm run test:existing-user
npm run test:existing-user -- --grep @positive
npm run test:existing-user -- --grep @cta
E2E_USE_SAVED_AUTH=true npm run test:calls -- --grep @existing-user
```
