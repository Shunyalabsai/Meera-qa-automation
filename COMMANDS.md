# Meera VAP — Test Commands

## Setup & Authentication

```bash
# Install dependencies & Playwright browser binaries
npm install && npm run install:browsers

# Configure environment variables
cp .env.example .env

# Save & verify authentication state
npm run auth:save           # interactive headed login to store auth state
npm run auth:google         # alias for Google auth flow
npm run auth:verify         # verify saved auth state works
```

---

## Test Execution Modes

```bash
npm test                    # full automated suite (headless)
npm run test:with-auth      # verify auth state first, then run full suite
npm run test:ui             # Playwright interactive UI mode
npm run test:headed         # run tests in headed browser
npm run test:debug          # run tests in step-by-step debug mode
npm run report              # view the HTML test report
```

---

## Run by Suite & User Journey

```bash
npm run test:smoke          # smoke tests (@smoke only)
npm run test:new-user       # first-time user journey (@new-user, ~375 tests)
npm run test:existing-user  # returning user with data (@existing-user, ~391 tests)
npm run test:positive       # positive test cases (@positive)
npm run test:negative       # negative test cases (@negative)
npm run test:edge           # edge test cases (@edge)
```

---

## Run by Dashboard Section

```bash
# Authentication
npm run test:auth           # all auth tests (sign-in, sign-up, session, SSO, logout)
npm run test:sign-in        # sign-in screen only
npm run test:sign-up        # sign-up screen only

# Dashboard Groups
npm run test:build          # BUILD: Agents, Prompts, Playground
npm run test:run            # RUN: Campaigns, Phone numbers, Live Calls
npm run test:analyze        # ANALYZE: Calls, Recordings, Insights
npm run test:settings       # SETTINGS: Alerts, Billing, Webhooks

# Specific Feature Suites
npm run test:agents         # BUILD › Agents
npm run test:playground     # BUILD › Playground
npm run test:prompt-templates # BUILD › Prompts & KB
npm run test:campaigns      # RUN › Campaigns
npm run test:phone-numbers  # RUN › Phone Numbers
npm run test:live-calls     # RUN › Live Calls
npm run test:calls          # ANALYZE › Calls
npm run test:recordings     # ANALYZE › Recordings
npm run test:insights       # ANALYZE › Insights
npm run test:alerts         # SETTINGS › Alerts
npm run test:billing        # SETTINGS › Billing
npm run test:webhooks       # SETTINGS › Webhooks
npm run test:whatsapp       # WhatsApp integration tests (@whatsapp)

# Global & UI Audits
npm run test:global         # Language, nav, responsive UI
npm run test:language       # Language selector tests
npm run test:cta            # CTA tests (@cta)
npm run test:cta-audit      # Full CTA audit spec
```

---

## Agent Templates & Journeys

```bash
# Agent Template Suites
npm run test:agent-templates          # all agent template tests (@templates)
npm run test:agent-templates-edge     # edge cases for agent templates (@edge)
npm run test:agents-onboarding        # agent onboarding flow (@onboarding)
npm run test:all-template-journeys    # end-to-end journey for all templates (@journey)
npm run test:cleanup-agents           # cleanup created test agents

# Individual Template Lifecycles
npm run test:credit-card-payment-reminder
npm run test:credit-card-payment-reminder-lifecycle
npm run test:order-confirmation-reschedule
npm run test:order-confirmation-reschedule-lifecycle
npm run test:appointment-reminder-reschedule
npm run test:appointment-reminder-reschedule-lifecycle
npm run test:retention-call
npm run test:retention-call-lifecycle
npm run test:start-from-scratch
npm run test:start-from-scratch-lifecycle
npm run test:prompt-templates-lifecycle
```

---

## Dashboard Layout Reference

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

## Utilities & Google Sheets Integration

```bash
npm run sheet:catalog       # scan specs → e2e/data/test-catalog.json
npm run sheet:real-catalog  # → e2e/REAL-TEST-CATALOG.csv (real cases by section)
npm run sheet:export        # merge last run → CSV per section tab
npm run sheet:publish       # push results to Google Sheet (service account)
npm run sheet:update        # export + publish (also runs automatically after npm test)
npm run sheet:manual-cases  # re-fetch manual QA steps from the QA sheet
npm run sheet:uat-fetch     # re-fetch the UAT bug-feedback snapshot (report "UAT July 2026" tab)
npm run sheet:populate-input # populate input sheet data
npm run sheet:dashboard     # build the local HTML dashboard (e2e/data/results-sheets/)
npm run issues:audit        # audit known issues against the latest run
```

Test results workbook: [Meera-Master-sheet-testCases](https://docs.google.com/spreadsheets/d/1MgzIeVQOLdquLraUnPH33vm-MvWBcijYmIZerHMG7Ro/edit) — details in [e2e/SHEET-RESULTS.md](./e2e/SHEET-RESULTS.md).
