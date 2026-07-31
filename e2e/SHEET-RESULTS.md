# Test Results Google Sheet

Live workbook: [Meera-Master-sheet-testCases](https://docs.google.com/spreadsheets/d/1MgzIeVQOLdquLraUnPH33vm-MvWBcijYmIZerHMG7Ro/edit)

Each **tab** = one dashboard section (BUILD, RUN, ANALYZE, …). The sheet is rebuilt
from the **latest run only** — no stale rows, no run separators, nothing accumulated.
Non-technical reviewers and engineers can both read every row: each test has a plain-
English name, steps to test it, the expected result, and (on failure) a human-readable
reason plus the raw error for debugging.

**The sheet is never filled with catalog placeholders or fake Pass rows.**

## Summary tab

The first tab is a dashboard with five sections:

1. **LATEST RUN — OVERVIEW** — run date, environment, overall status, pass/fail/skipped
   counts, pass rate, duration.
2. **MODULE BREAKDOWN — LATEST RUN** — per-module pass/fail/skipped totals and pass rate.
3. **MOST COMMON FAILURE REASONS — LATEST RUN** — the plain-English failure reasons that
   occurred most, with counts.
4. **RUN HISTORY** — one row per stored run (newest first) so you can compare runs over time.

## Section tabs (latest run only)

Each dashboard group tab (e.g. `BUILD`, `ANALYZE`, `SETTINGS`) lists every test that ran in
that section during the **latest** run. A tab is deleted if the latest run has no rows for it,
so the workbook only ever contains the current run's sections.

## Column layout (12 readable columns)

| # | Column | Description |
|---|--------|-------------|
| 1 | Test ID | e.g. `TC-CL-001` — links to the spec line on GitHub |
| 2 | Test Case | Human-readable test name — links to the spec line |
| 3 | Module | Dashboard group › sub-group, e.g. `Analyze › Calls` |
| 4 | Priority | `High` / `Medium` / `Low` / `Critical` |
| 5 | Status | **Pass / Fail / Skipped** (real run outcome only) |
| 6 | How to test | Real numbered steps from the manual QA sheet when the TC ID is registered; otherwise an honest pointer to the automated test code |
| 7 | Expected result | What the test expected to happen |
| 8 | Failure reason | Plain-English sentence a non-technical reviewer can act on (empty on Pass) |
| 9 | Error detail | Raw Playwright error for engineers (empty on Pass) |
| 10 | Screenshot | Failure screenshot — inline image on the sheet when Drive upload is enabled, otherwise the local file path |
| 11 | Duration (s) | Test duration |
| 12 | Spec file | Path under `e2e/tests/suite/` — links to the file on GitHub |

### Failure reasons are rewritten in plain English

`sheet-format.mjs` converts raw errors like

> `Timeout 30000ms exceeded while waiting for locator('button.agent-submit') to be visible`

into

> `The test timed out (30 seconds) while waiting to click "Submit agent (button)". It never became available — the page may have loaded slowly, an earlier step failed, or the UI changed.`

Network errors, timeouts, visibility/hidden/enabled/checked assertions, strict-mode
violations, and JavaScript errors each have their own human sentence. The raw error is kept
in **Error detail** for engineers.

### Screenshots

- Captured automatically on every failure (`sheet-results.reporter`).
- Uploaded to a Drive folder (`Meera VAP Test Report Screenshots`) and embedded inline via
  `IMAGE()` when the Drive API is enabled.
- If the Drive API is disabled, the local path is shown instead (no crash, no missing rows).
  Enable it at:
  https://console.cloud.google.com/apis/api/drive.googleapis.com/overview

## Visual formatting (applied on publish)

| Element | Style |
|---------|--------|
| Summary title / section rows | Merged across the tab, dark blue / blue-grey background |
| Table headers | Dark blue background, white bold text, frozen |
| **Fail** rows | Light red background, bold red text |
| **Pass** rows | Light green background |
| **Skipped** rows | Light yellow background |
| Test ID / Test Case / Spec File | Clickable links to GitHub (when `GOOGLE_SHEET_REPO_URL` is set) |
| Environment (Summary) | Clickable link to the staging URL |

Every publish **unmerges all cells first**, clears the tab, writes fresh values, then
re-applies formatting — so stale merges from an older layout can never hide data.

## Run history (local, for the Summary)

Publish history is stored locally in `e2e/data/sheet-run-history.json` (up to
`SHEET_MAX_RUN_HISTORY` runs, default 100). The **Summary → RUN HISTORY** table reads from it.

- Re-publishing the same `Run ID` rebuilds the sheet but does **not** duplicate that run.

## Automatic updates

After **every** Playwright run (`npm test`, `npm run test:existing-user`, `--grep`, etc.):

1. `sheet-results.reporter` writes `test-results/sheet-results.json` (this run only)
2. `export-results-sheet.mjs` joins manual-case steps + friendly reasons, appends the run to
   `e2e/data/sheet-run-history.json`, and writes the merged payload + CSVs
3. `publish-google-sheet.mjs` rebuilds the Google Sheet (unmerge → clear → write → format)
   when credentials are in `.env`

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
| `E2E_SHEET_AUTO_PUBLISH=false` | Disable auto-publish; export CSVs only |
| `GOOGLE_SHEET_REPO_URL` | Base GitHub URL for clickable Test ID / Test Case / Spec File links |
| `E2E_SHEET_RUN_JOURNEY` | Force run journey label on Summary (optional) |
| (unset locally) | Auto-publish enabled |
| (unset in CI) | Auto-publish disabled |

Manual re-publish without re-running tests (uses the last run's merged JSON):

```bash
npm run sheet:update
```

## UAT reference tab

The report sheet also carries a **UAT July 2026** tab that mirrors the QA team's
[UAT & functional bug-feedback log](https://docs.google.com/spreadsheets/d/1bR1d9NwurDtGvnZ-TvQsRLapaNOlqAx5NexIh01JCVQ/edit)
(TC-001…043: scenario, preconditions, `>`-breadcrumb steps, expected result, priority,
type, reference screenshot/mov, dev status). The tab is a committed snapshot —
`e2e/scripts/fetch-uat-cases.mjs` pulls it into `e2e/data/uat-cases.mjs`
(run `npm run sheet:uat-fetch`), and every publish re-writes the tab from that
snapshot with a footer row that hyperlinks back to the live sheet.

It is **reference-only**: UAT cases have no automation coverage, so they don't join
the run-based section tabs or the Summary.

## Manual test cases (steps / expected)

`e2e/scripts/fetch-manual-cases.mjs` pulls the manual QA cases from the
[Meera VAP QA Test Cases sheet](https://docs.google.com/spreadsheets/d/1V56bydTla54TIyYX4pdlDnUtRaN76oiVK24o6ZOQOaM/edit)
into `e2e/data/manual-test-cases.mjs` (run `npm run sheet:manual-cases`).

Automated results whose TC ID matches a manual case inherit its real **steps to test** and
**expected result**. Tests without a registered manual case get an honest auto-derived
pointer to the automated spec code instead of a fabricated step list.

## Commands

```bash
# Full new-user journey + auto-publish
E2E_USE_SAVED_AUTH=true npm run test:new-user

# Existing-user journey + auto-publish
E2E_USE_SAVED_AUTH=true npm run test:existing-user

# Manual export + publish (same as the auto-update hook)
npm run sheet:update
npm run sheet:export    # CSV only
npm run sheet:publish   # push existing merged JSON

# Re-fetch manual cases from the manual QA sheet
npm run sheet:manual-cases

# Re-fetch the UAT bug-feedback snapshot (used by the "UAT July 2026" tab)
npm run sheet:uat-fetch

# Catalog metadata only (not sent to Sheet alone)
npm run sheet:catalog
```

## Google Sheets / Drive API setup

1. Share the spreadsheet with the service account email as **Editor**.
2. Enable the **Drive API** for inline failure screenshots:
   https://console.cloud.google.com/apis/api/drive.googleapis.com/overview
   (optional — without it, screenshots fall back to local file paths).

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
| BUILD | `e2e/tests/suite/build/` |
| RUN | `e2e/tests/suite/run/` |
| ANALYZE | `e2e/tests/suite/analyze/` |
| SETTINGS | `e2e/tests/suite/settings/` |
| Global UI | `e2e/tests/suite/global/` |
| Workspace | `e2e/tests/suite/workspace/` |
| Authentication | `e2e/tests/suite/authentication/` |
| QA Registry | `e2e/tests/suite/qa/` |
| Summary | Run overview, module breakdown, top failure reasons, run history |
