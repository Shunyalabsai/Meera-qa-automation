# QA Test Coverage

The suite is **fully automated** — there are no manual/placeholder test cases in the
project anymore. Every spec under `e2e/tests/suite/**` is an executable Playwright
test against the live app.

The authoritative inventory is generated from the specs themselves:

```bash
npm run sheet:catalog        # scan specs → e2e/data/test-catalog.json
npm run sheet:real-catalog   # → e2e/REAL-TEST-CATALOG.csv (real cases, by section)
```

## Layers

| Layer | Tag | Command |
|-------|-----|---------|
| Happy path | `@positive` | `npm run test:positive` |
| Validation / failures | `@negative` | `npm run test:negative` |
| Boundary cases | `@edge` | `npm run test:edge` |
| CTA functional | `@cta` | `npm run test:cta` |

> `--grep @positive` matches any test title containing `@positive`, including journey specs.

## By dashboard section

| Section | Coverage |
|---------|----------|
| **Authentication** | sign-in, sign-up, SSO, extended-negative, security |
| **BUILD › Agents** | 5 template journeys + onboarding, lifecycle, `templates/edge-cases` matrix, validation |
| **BUILD › Prompts** | list / empty-state / create / edit / lifecycle / edge |
| **BUILD › Playground** | browser mode, phone (Plivo) mode, negative, edge |
| **RUN › Phone numbers** | list, add-number modal, negative, edge |
| **RUN › Campaigns** | empty state, agent-required, phone-numbers link |
| **RUN › Live Calls** | empty state, page load, positive, edge |
| **ANALYZE › Calls** | list, filters, search, negative, edge |
| **ANALYZE › Recordings** | list, filters, search, negative, edge |
| **ANALYZE › Insights** | KPIs, widgets, filters, negative, edge |
| **SETTINGS › Alerts** | rules, channels, negative, edge, cta |
| **SETTINGS › Billing** | usage, filters, negative, edge, cta |
| **SETTINGS › Webhooks** | quick-apply, subscriptions, custom events, negative, edge, cta, e2e delivery |
| **Global UI** | navigation, responsive, language switcher, ui-coverage, cta-audit |

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
npm test                          # all automated tests
npm run test:positive             # happy-path only
npm run test:negative             # validation & failures
npm run test:edge                 # boundary cases
npm run test:agent-templates-edge # agent form edges only
```

## Out of scope for browser E2E (future manual effort — TBD)

These were intentionally **removed** from the automated project to avoid confusion
and will be planned separately later:

- Live voice calls (Hindi, Hinglish, silence, noise, DTMF)
- Telephony (inbound, concurrent, caller-ID spoofing)
- API security (JWT tampering, rate limits, IDOR, SSRF)
- Performance (latency, concurrent calls)
- Infrastructure (encryption at rest, multi-tenant isolation)
