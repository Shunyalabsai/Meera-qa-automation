# QA Test Coverage Matrix

All **132 Google Sheet cases** are represented in the Playwright suite.

## Three layers

| Layer | Tag | Count (approx) | Command |
|-------|-----|----------------|---------|
| **UI automated** | `@positive` `@negative` `@edge` | ~600+ executable tests | `npm run test:positive` etc. |
| **Manual / telephony / API** | `@manual` `@catalog` | 100 sheet cases | `npm run test:manual` |
| **Registry audit** | `@qa-audit` | 1 | `npm run test:qa-audit` |

> Playwright `--grep @positive` matches any test title containing `@positive`, including journey specs.

## By dashboard section

| Section | Positive | Negative / Edge | Manual (sheet TC ID) |
|---------|----------|-----------------|----------------------|
| **Authentication** | sign-in, sign-up, SSO | extended-negative, security | TC-AU-* session/API |
| **BUILD › Agents** | 5 card journeys + onboarding | templates/edge-cases (116), validation | POC gaps, mid-call delete |
| **BUILD › Prompts** | 00–05 specs | 04-validation, 06-edge | Legacy KB upload (TC-KB-*) |
| **BUILD › Playground** | `00–04` journey specs | `@negative` `@edge` | Live voice calls (TC-VC-*) |
| **RUN › Phone numbers** | positive | negative | API outbound, concurrent |
| **RUN › Campaigns** | positive | — | — |
| **RUN › Live Calls** | positive | — | Inbound telephony |
| **ANALYZE › Calls** | `00–04` journey specs | `@negative` `@edge` | Transcript security, telephony |
| **ANALYZE › Recordings** | `00–04` journey specs | `@negative` `@edge` | Auth on recording URL, retention |
| **ANALYZE › Insights** | `00–04` journey specs | `@negative` `@edge` | KPI/chart data after calls |
| **SETTINGS › Alerts** | `00–06` journey specs | `@negative` `@edge` `@cta` | Alert firing, channel delivery |
| **SETTINGS › Billing** | `00–05` journey specs | `@negative` `@edge` `@cta` | Usage chart after calls |
| **SETTINGS › Webhooks** | `00–05` journey specs | `@negative` `@edge` `@cta` | SSRF, API keys |
| **Global UI** | ui-coverage, responsive | ui-coverage | Performance (TC-PF-*), SC-* |

## Agent form edge matrix (all 5 gallery entries)

`templates/edge-cases.spec.ts` — **22 cases × 5 entries = 110 tests**

- Name: empty, whitespace, 256 chars, XSS, unicode, special chars
- Prompt: empty system prompt
- Behaviour: empty first message, silence/duration bounds
- Advanced: temperature, tokens, pre-call URL
- Outcomes: bad JSON, array JSON

## Commands

```bash
npm run auth:save
npm test                          # all tests (many manual will skip)
npm run test:positive             # happy-path only
npm run test:negative             # validation & failures
npm run test:edge                 # boundary cases
npm run test:manual               # 100 sheet cases (documented skips)
npm run test:agent-templates-edge # agent form edges only
npm run coverage:report           # registry vs sheet
```

## What requires manual execution

These **cannot** be fully automated in browser E2E:

- Live voice calls (Hindi, Hinglish, silence, noise, DTMF)
- Telephony (inbound, concurrent, caller ID spoofing)
- API security (JWT tampering, rate limits, IDOR)
- Performance (latency, 50 concurrent calls, 100MB PDF)
- Infrastructure (encryption at rest, multi-tenant isolation)

Each has a Playwright test with `@manual` and the exact sheet steps in the skip reason.
