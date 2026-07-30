# Test Results Google Sheet

Live workbook: [Meera-Master-sheet-testCases](https://docs.google.com/spreadsheets/d/1MgzIeVQOLdquLraUnPH33vm-MvWBcijYmIZerHMG7Ro/edit)

Each **tab** = one dashboard group (BUILD, RUN, ANALYZE, …).  
Each **run** is appended — past and future runs stay on the sheet (nothing overwritten).

**The sheet is never filled with catalog placeholders or fake Pass rows.**

## New User vs Existing User

Every test row has a **Journey** column:

| Journey | When |
|---------|------|
| **New User** | Test tagged `@new-user` |
| **Existing User** | Test tagged `@existing-user` or under `e2e/tests/suite/existing-user/` |
| **General** | Full suite / mixed runs without a journey tag |

The **Summary** tab also has a **Journey** column per run (`New User`, `Existing User`, `Full Suite`, or partial labels when mixed).

Override run-level journey when needed:

```bash
E2E_SHEET_RUN_JOURNEY="Existing User" npm run test:existing-user
```

## Visual layout (formatted on publish)

| Element | Style |
|---------|--------|
| Header row | Dark blue background, white bold text, frozen |
| **Fail** rows | Light red background, bold red text |
| **Pass** rows | Light green background |
| **Skipped** rows | Light yellow background |
| **Run separator** | Grey merged row between runs (latest run at top) |
| **Journey** cell | Blue tint (New User) or purple tint (Existing User) |
| **Test ID / Title / Spec File** | Clickable links to GitHub (when `GOOGLE_SHEET_REPO_URL` is set) |
| **Environment** | Clickable link to staging URL |

Section tabs and Summary both use grey separators between runs so you can scroll from **latest → previous** runs.

## Run history (append-only)

Every publish **adds** a new block for that run. Older runs remain below (newest first).

- **Section tabs:** header once, then test rows from every run (newest first). Grey separator row before each older run. **Run ID** column identifies the run.
- **Summary tab:** one stats row per run, grey separator between runs.
- History is stored locally in `e2e/data/sheet-run-history.json` (up to `SHEET_MAX_RUN_HISTORY` runs, default 100).
- Re-publishing the same `Run ID` rebuilds the sheet but does **not** duplicate that run.

## Automatic updates

After **every** Playwright run (`npm test`, `npm run test:existing-user`, `--grep`, etc.):

1. `sheet-results.reporter` writes `test-results/sheet-results.json` (this run only)
2. Export appends the run to `e2e/data/sheet-run-history.json`
3. Google Sheet is rebuilt from **full history** and published when credentials are in `.env`

No manual `npm run sheet:update` needed for normal local runs.

```bash
# .env — enable auto-publish (default: on locally, off in CI unless set)
E2E_SHEET_AUTO_PUBLISH=true
GOOGLE_RESULTS_SHEET_ID=1MgzIeVQOLdquLraUnPH33vm-MvWBcijYmIZerHMG7Ro
GOOGLE_SERVICE_ACCOUNT_JSON=./meera-500407-7ed504955ec2.json
GOOGLE_SHEET_REPO_URL=https://github.com/yamini-pal-singh/Meera-VAP-Yamini
```

| Env | Effect |
|-----|--------|
| `E2E_SHEET_AUTO_PUBLISH=true` | Force auto-publish (use in CI) |
| `E2E_SHEET_AUTO_PUBLISH=false` | Disable auto-publish; export CSVs only via reporter JSON |
| `GOOGLE_SHEET_REPO_URL` | Base GitHub URL for clickable Test ID / Title / Spec File links |
| `E2E_SHEET_RUN_JOURNEY` | Force run journey label on Summary (optional) |
| (unset locally) | Auto-publish enabled |
| (unset in CI) | Auto-publish disabled |

Manual re-publish without re-running tests (uses last run JSON):

```bash
npm run sheet:update
```

## No flaky / stale rows

- **Retries:** only the **final** attempt per test is stored (failed-then-passed → Pass).
- **History:** each run keeps its own rows — results are not merged into a single “latest” row per test.
- **Summary tab:** lists **every stored run** (newest at top), separated by grey rows.
- **Section tabs:** all runs’ test rows appended with grey run dividers.

## Column layout

| Column | Description |
|--------|-------------|
| Test ID | e.g. `TC-CM-011` — links to spec line on GitHub |
| Title | Human-readable test name — links to spec line |
| **Journey** | New User / Existing User / General |
| Priority | `@high`, `@medium`, `@low`, `@critical` |
| Type | `@positive`, `@negative`, `@edge`, `@ui`, `@manual`, `@cta` |
| Tags | All `@tags` from the test title |
| Spec File | Path under `e2e/tests/suite/` — links to file on GitHub |
| Describe Block | Parent `test.describe` name |
| Status | **Pass / Fail / Skipped** (real run outcome only) |
| Last Run At | ISO timestamp when that test last ran |
| Duration (s) | Test duration |
| Result Reason | Error message or skip reason (empty on pass) |
| Environment | `PLAYWRIGHT_BASE_URL` — clickable staging URL |
| Run ID | Unique id of the run that produced this row |

## Commands

```bash
# New-user journey
E2E_USE_SAVED_AUTH=true npm run test:new-user

# Existing-user journey
E2E_USE_SAVED_AUTH=true npm run test:existing-user

# Manual export + publish (same as auto-update hook)
npm run sheet:update
npm run sheet:export    # CSV only
npm run sheet:publish   # push existing merged JSON

# Catalog metadata only (not sent to Sheet alone)
npm run sheet:catalog
```

## Google Sheets API setup

Share the spreadsheet with the service account email as **Editor**.

## CI example

```yaml
- run: E2E_USE_SAVED_AUTH=true npx playwright test --project=setup --project=chromium
  env:
    E2E_SHEET_AUTO_PUBLISH: "true"
    GOOGLE_SERVICE_ACCOUNT_JSON: ${{ secrets.GOOGLE_SERVICE_ACCOUNT_JSON }}
    GOOGLE_SHEET_REPO_URL: https://github.com/yamini-pal-singh/Meera-VAP-Yamini
```

## Section tabs

| Tab | Tests folder |
|-----|----------------|
| Authentication | `e2e/tests/suite/authentication/` |
| BUILD | `e2e/tests/suite/build/` |
| RUN | `e2e/tests/suite/run/` |
| ANALYZE | `e2e/tests/suite/analyze/` |
| SETTINGS | `e2e/tests/suite/settings/` |
| Global UI | `e2e/tests/suite/global/` |
| Workspace | `e2e/tests/suite/workspace/` |
| QA Registry | `e2e/tests/suite/qa/` |
| Summary | One row per stored run (full history) |
