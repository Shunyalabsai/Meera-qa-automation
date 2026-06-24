# Google SSO for Playwright

Meera staging uses **Clerk** hosted at `accounts.shunyalabs.ai` with **Google SSO**.

## Save session (recommended)

**Important:** This must run with a **visible browser** so you can complete Google login manually.

```bash
npm run auth:save
```

1. A **Chrome window opens** with **Sign in to Shunya Labs**
2. **You** click **Google** (the script does not click it for you)
3. Sign in as `E2E_GOOGLE_EMAIL`
4. If you see a black **Loading…** screen, wait — the script reloads `/vap/` automatically
5. When **Agents** appears, the session saves to `.auth/user.json`

**Run tests within 1–2 minutes** — Clerk session JWTs expire quickly (~60s):

```bash
npm run auth:save && npm run auth:verify && npm test
```

Or use:

```bash
npm run test:with-auth
```

(`test:with-auth` verifies the saved session first; re-run `auth:save` if verify fails.)

## Why Clerk shows OTP instead of password

If you enter `E2E_GOOGLE_EMAIL` on the Clerk sign-in page and click **Continue**, you will see **“Check your email”** (6-digit code) — **not** a password field. That is expected:

| How the account was created | What Clerk shows after email + Continue |
|----------------------------|----------------------------------------|
| **Google SSO** (your case) | Email OTP, or use **Sign in with Google** |
| **Email + password** (dedicated test user) | Password field |

Your Google-linked account does not use email/password login. For E2E:

- **Authenticated suite** → use `npm run auth:save` and click **Google** (not the email field)
- **Password login tests** (`TC-AU-001`, `TC-AU-101`, `TC-AU-104`) → need a separate Clerk user with `E2E_CLERK_EMAIL` + `E2E_CLERK_PASSWORD`, or they are skipped

If no window appears:

```bash
npx playwright test e2e/auth.save.setup.ts --project=auth-save --headed
```

Then in `.env`:

```
E2E_USE_SAVED_AUTH=true
```

## Re-save when tests fail with "session expired"

Clerk JWTs expire quickly. Before a test run:

```bash
npm run auth:save && npm test
```

## Email/password tests (optional)

Requires a **separate** Clerk account created with email+password (not your Google SSO email):

```
E2E_CLERK_EMAIL=e2e-password@yopmail.com
E2E_CLERK_PASSWORD=your-password
```

Tests: `TC-AU-001`, `TC-AU-101`, `TC-AU-104`. Skipped automatically if unset.

## Unsigned tests

Sign-in and sign-up specs run in the **unsigned** Playwright project (no saved cookies).

Authenticated specs use `.auth/user.json` via the **chromium** project.

## Sign-out

`logout/sign-out.spec.ts` runs only with `npm run test:auth` — it clears the session and would break the default suite if included in `npm test`.
