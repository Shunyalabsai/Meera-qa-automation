# Test Results Google Sheet

Live workbook: [Meera-Master-sheet-testCases](https://docs.google.com/spreadsheets/d/1MgzIeVQOLdquLraUnPH33vm-MvWBcijYmIZerHMG7Ro/edit)

Each **tab** = one dashboard group (BUILD, RUN, ANALYZE, …).  
Each **row** = one test with its **latest real staging result** — Pass, Fail, or Skipped only.

**The sheet is never filled with catalog placeholders or fake Pass rows.**

## Automatic updates

After **every** Playwright run (`npm test`, `npm run test:settings`, `--grep`, etc.):

1. `sheet-results.reporter` writes `test-results/sheet-results.json` (this run only)
2. Export merges into `e2e/data/test-results-latest.json` (per-test latest outcome)
3. Google Sheet is published automatically when credentials are in `.env`

No manual `npm run sheet:update` needed for normal local runs.

```bash
# .env — enable auto-publish (default: on locally, off in CI unless set)
E2E_SHEET_AUTO_PUBLISH=true
GOOGLE_RESULTS_SHEET_ID=1MgzIeVQOLdquLraUnPH33vm-MvWBcijYmIZerHMG7Ro
GOOGLE_SERVICE_ACCOUNT_JSON=./meera-500407-7ed504955ec2.json
```

| Env | Effect |
|-----|--------|
| `E2E_SHEET_AUTO_PUBLISH=true` | Force auto-publish (use in CI) |
| `E2E_SHEET_AUTO_PUBLISH=false` | Disable auto-publish; export CSVs only via reporter JSON |
| (unset locally) | Auto-publish enabled |
| (unset in CI) | Auto-publish disabled |

Manual re-publish without re-running tests (uses last run JSON):

```bash
npm run sheet:update
```

## No flaky / stale rows

- **Retries:** only the **final** attempt per test is stored (failed-then-passed → Pass).
- **Partial runs:** tests you run update their rows; other tests keep their previous latest result (not reset to Pass).
- **Summary tab:** reflects **this run** only (counts, duration, run id).
- **Section tabs:** show **latest per-test** results across runs.

## Column layout

| Column | Description |
|--------|-------------|
| Test ID | e.g. `TC-CM-011`, `CTA-AG-006` |
| Title | Human-readable test name |
| Priority | `@high`, `@medium`, `@low`, `@critical` |
| Type | `@positive`, `@negative`, `@edge`, `@ui`, `@manual`, `@cta` |
| Tags | All `@tags` from the test title |
| Spec File | Path under `e2e/tests/suite/` |
| Describe Block | Parent `test.describe` name |
| Status | **Pass / Fail / Skipped** (real run outcome only) |
| Last Run At | ISO timestamp when that test last ran |
| Duration (s) | Test duration |
| Result Reason | Error message or skip reason (empty on pass) |
| Environment | `PLAYWRIGHT_BASE_URL` (staging URL from the run) |
| Run ID | Unique id of the run that produced this row |

## Commands

```bash
# Run tests — sheet updates automatically when .env has Google credentials
E2E_USE_SAVED_AUTH=true npm test
E2E_USE_SAVED_AUTH=true npm run test:settings

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
| Summary | Run-level counts for the latest run |
