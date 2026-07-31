# Meera VAP — Test Commands

## Setup

```bash
npm install && npm run install:browsers
cp .env.example .env
npm run auth:save
```

---

## Run by dashboard section

```bash
npm test                    # full automated suite
npm run test:smoke          # @smoke only
npm run test:new-user       # first-time user journey (@new-user, ~375 tests)
npm run test:existing-user  # returning user with data (@existing-user, ~391 tests)

# Authentication (sign-in screen)
npm run test:auth           # all auth (includes logout)
npm run test:sign-in
npm run test:sign-up

# Dashboard groups
npm run test:build          # BUILD: Agents, Prompts, Playground
npm run test:run            # RUN: Campaigns, Phone numbers, Live Calls
npm run test:analyze        # ANALYZE: Calls, Recordings, Insights
npm run test:settings       # SETTINGS: Alerts, Billing, Webhooks

# Single areas
npm run test:agents         # BUILD › Agents only
npm run test:global         # Language, nav, responsive
```

---

## Dashboard layout

```
Authentication
├── sign-in/     Google, GitHub, email (Clerk)
├── sign-up/
├── session/
├── google-sso/
└── logout/

BUILD
├── agents/      TC-AG-*
├── prompts/     TC-KB-*
└── playground/  TC-VC-* (UI), phone dial validation

RUN
├── campaigns/
├── phone-numbers/
└── live-calls/  TC-AN-006

ANALYZE
├── calls/       TC-AN-001
├── recordings/
└── insights/

SETTINGS
├── alerts/
├── billing/
└── webhooks/    TC-IN-001

Workspace & Account
Global UI
```

---

## Utilities

```bash
npm run sheet:catalog       # scan specs → e2e/data/test-catalog.json
npm run sheet:real-catalog  # → e2e/REAL-TEST-CATALOG.csv (real cases by section)
npm run sheet:export        # merge last run → CSV per section tab
npm run sheet:publish       # push results to Google Sheet (service account)
npm run sheet:update        # export + publish (also runs automatically after npm test)
npm run sheet:manual-cases  # re-fetch manual QA steps from the QA sheet
npm run sheet:uat-fetch     # re-fetch the UAT bug-feedback snapshot (report "UAT July 2026" tab)
npm run sheet:dashboard     # build the local HTML dashboard (e2e/data/results-sheets/)
npm run issues:audit        # audit known issues against the latest run
npm run report
```

Test results workbook: [Meera-Master-sheet-testCases](https://docs.google.com/spreadsheets/d/1MgzIeVQOLdquLraUnPH33vm-MvWBcijYmIZerHMG7Ro/edit) — details in [e2e/SHEET-RESULTS.md](./e2e/SHEET-RESULTS.md).
