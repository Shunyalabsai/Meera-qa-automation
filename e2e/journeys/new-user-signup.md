# New User Sign-Up Journey

End-to-end flow for a first-time Meera VAP user (Clerk hosted auth).

## Flow

```
1. Sign-up landing (accounts.shunyalabs.ai/sign-up)
   ├── GitHub / Google SSO
   └── Email + Password → Continue

2. Email verification
   ├── "Verify your email" + 6-digit OTP
   ├── Edit email (pencil icon)
   └── Resend code (countdown timer)

3. Redirect → Dashboard (BUILD › Agents)
   ├── "Build your first voice agent"
   ├── Step 1: Create an agent
   ├── Step 2: Add a phone number
   ├── Step 3: Test in Playground
   └── CTA: "Create your first agent →"
```

## Automated tests

| Step | Spec file | TC ID |
|------|-----------|-------|
| Landing | `sign-up.landing.spec.ts` | TC-AU-SU-001, 002 |
| Navigation | `sign-up.navigation.spec.ts` | TC-AU-SU-003, 004 |
| Password rules | `sign-up.validation.spec.ts` | TC-AU-SU-005–007 |
| OTP screen UI | `sign-up.verification.spec.ts` | TC-AU-SU-008 |
| Full journey + dashboard | `sign-up.journey.spec.ts` | TC-AU-SU-009 (needs OTP env) |
| Post sign-up dashboard | `build/agents/onboarding/` | TC-AG-ON-001–032 |
| Prompt Templates | `build/prompts/` | TC-PT-001–043 |
| Playground | `build/playground/` | TC-PG-001–043 |
| Campaigns | `run/campaigns/` | TC-CM-001–043 |
| Phone numbers | `run/phone-numbers/` | TC-PN-001–043 |
| Live Calls | `run/live-calls/` | TC-LC-001–043 |
| Calls | `analyze/calls/` | TC-CL-001–043, TC-AN-001–007 |
| Recordings | `analyze/recordings/` | TC-RC-001–043 |
| Insights | `analyze/insights/` | TC-IS-001–043, TC-AN-004 |
| Alerts | `settings/alerts/` | TC-AL-001–043 |
| Billing | `settings/billing/` | TC-BL-001–043 |
| Webhooks | `settings/webhooks/` | TC-WH-001–043, TC-IN-001–005 |
| Language switcher | `global/language/` | TC-LG-001–043 |

## Run

```bash
# 1. Save Google SSO session (interactive — browser opens, click Google, sign in)
npm run auth:save

# 2. First-time user journey — all @new-user tests (~375 tests, empty-state dashboard)
npm run test:new-user

# Or run by layer
npm run test:new-user -- --grep @positive
npm run test:new-user -- --grep @negative
npm run test:new-user -- --grep @edge
```

Requires `E2E_USE_SAVED_AUTH=true` in `.env` (see `.env.example`).

Re-save auth when setup fails with "Saved session expired":
```bash
npm run auth:save && npm run test:new-user
```

## Manual step

Clerk sends a **6-digit verification code** to the email. Automation stops at OTP unless `E2E_SIGNUP_OTP` is set (copy from yopmail or your test inbox).

After OTP → user lands on `https://meera-stage.shunyalabs.ai/vap/agents` with the new-user onboarding card.
