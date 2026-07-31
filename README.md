# Meera Voice Agent Platform — E2E Tests

Playwright tests for [Meera VAP](https://agents.shunyalabs.ai/) organized to match the **dashboard sidebar** (BUILD / RUN / ANALYZE / SETTINGS), plus Authentication and Global UI.

Sheet cases: [QA Google Sheet](https://docs.google.com/spreadsheets/d/1V56bydTla54TIyYX4pdlDnUtRaN76oiVK24o6ZOQOaM/edit) (132 total).

**Test results sheet** (pass/fail per run, one tab per section): [Meera-Master-sheet-testCases](https://docs.google.com/spreadsheets/d/1MgzIeVQOLdquLraUnPH33vm-MvWBcijYmIZerHMG7Ro/edit) — see [e2e/SHEET-RESULTS.md](./e2e/SHEET-RESULTS.md).

**Commands:** [COMMANDS.md](./COMMANDS.md)

---

## Quick start

```bash
npm install && npm run install:browsers
cp .env.example .env
npm run auth:save
npm test
npm run sheet:catalog       # scan all specs into catalog
npm run sheet:real-catalog  # → e2e/REAL-TEST-CATALOG.csv (real cases by section)
npm run sheet:export        # CSV per section tab (after a test run)
npm run sheet:publish       # push to Google Sheet (needs service account)
```

---

## Test structure (matches dashboard)

```
e2e/tests/suite/
├── authentication/          Sign-in, Sign-up, Session, Google SSO, Logout
├── build/
│   ├── agents/              Agent CRUD, validation, new-user onboarding
│   ├── prompts/             Prompt templates / KB
│   └── playground/          Voice test UI, outbound dial validation
├── run/
│   ├── campaigns/
│   ├── phone-numbers/
│   └── live-calls/
├── analyze/
│   ├── calls/
│   ├── recordings/
│   └── insights/
├── settings/
│   ├── alerts/
│   ├── billing/
│   └── webhooks/
├── workspace/               Org switcher, personal workspace, user profile
└── global/                  Sidebar nav, responsive, language selector
```

### Dashboard ↔ TC ID prefixes

| Dashboard | Primary TC ID prefixes |
|-----------|------------------------|
| BUILD › Agents | TC-AG-* |
| BUILD › Prompts | TC-PT-*, TC-KB-* |
| BUILD › Playground | TC-PG-*, TC-VC-* (UI / dial validation) |
| RUN › * | TC-PN-*, TC-CM-*, TC-LC-*, TC-AN-006 |
| ANALYZE › Calls | TC-AN-*, TC-CL-* |
| SETTINGS › Webhooks | TC-WH-*, TC-IN-* |
| Authentication | TC-AU-* |
| Global UI | TC-UI-*, TC-LG-* |

---

## Layers

| Layer | Command |
|-------|---------|
| Automated Playwright | `npm test` |
| Positive only | `npm run test:positive` |
| Negative only | `npm run test:negative` |
| Edge only | `npm run test:edge` |
| Per dashboard group | `npm run test:build`, `test:run`, etc. |
| Coverage overview | [e2e/COVERAGE.md](./e2e/COVERAGE.md) |
