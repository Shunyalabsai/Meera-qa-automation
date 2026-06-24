# Meera Voice Agent Platform — E2E Tests

Playwright tests for [Meera VAP](https://meera-stage.shunyalabs.ai/) organized to match the **dashboard sidebar** (BUILD / RUN / ANALYZE / SETTINGS), plus Authentication and Global UI.

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
npm run coverage:report
npm run sheet:catalog    # scan all 800+ tests into catalog
npm run sheet:export     # CSV per section tab (after a test run)
npm run sheet:publish    # push to Google Sheet (needs service account)
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
├── global/                  Sidebar nav, responsive, language selector
└── catalog.spec.ts          Remaining sheet cases by dashboard section
```

### Dashboard ↔ Sheet mapping

| Dashboard | Sheet cases routed here |
|-----------|-------------------------|
| BUILD › Agents | TC-AG-* |
| BUILD › Prompts | TC-KB-* |
| BUILD › Playground | TC-VC-* (voice/telephony UI) |
| RUN › * | TC-VC-* (phone, live), TC-AN-006 |
| ANALYZE › Calls | TC-AN-* |
| SETTINGS › Webhooks | TC-IN-* |
| Authentication | TC-AU-* |
| Global UI | TC-UI-*, TC-PF-*, TC-EC-*, TC-SC-* |

---

## Layers

| Layer | Command |
|-------|---------|
| Automated Playwright | `npm test` |
| Positive only | `npm run test:positive` |
| Negative only | `npm run test:negative` |
| Edge only | `npm run test:edge` |
| Manual sheet catalog (132 cases) | `npm run test:manual` |
| Per dashboard group | `npm run test:build`, `test:run`, etc. |
| Coverage matrix | [e2e/COVERAGE.md](./e2e/COVERAGE.md) |
| Registry vs sheet | `npm run coverage:report` |
