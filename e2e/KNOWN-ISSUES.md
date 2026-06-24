# Known issues — how we tell test bug vs staging/product bug

## Decision tree

| Symptom | Category | What to do |
|--------|----------|------------|
| Locator wrong but UI is correct (accessible name, role, spinbutton) | **Test fix** | Fix page object — no registry entry |
| Staging nginx 404 on reload/deep link; sidebar nav works | **staging-infra** | Use `gotoApp()` / `reloadSpaRoute()` — document in `STAGING_INFRA` |
| App missing validation, wrong link href, accepts bad data | **product-gap** | Test **fails** OR `skipProductGap()` with id in `known-issues.mjs` |
| Scenario impossible via real UI (e.g. type=date + free text) | **untestable-ui** | Skip with id — do **not** DOM-hack |
| Workspace empty / no telephony accounts / call in progress | **env-precondition** | Skip with `[env-precondition] …` — no registry id required |
| Needs telephony, second org, manual OTP | **manual** | `test.skip(true, "[manual] …")` |

**Rule:** If we would need `evaluate()` to set invalid values the user cannot enter, it is **untestable-ui**, not a test fix.

## Registry

Single source of truth: [`e2e/data/known-issues.mjs`](data/known-issues.mjs)

Each entry has:

- **category** — one of `product-gap`, `untestable-ui`, …
- **summary** — shows in Playwright report + Google Sheet skip reason
- **status** — `open` | `fixed` | `wont-fix-test`
- **fix** / **alternative** — what engineering or another test should do

## Skip reason format

Always prefix so reports and Sheet are scannable:

```
[product-gap:CM-LINK-001] Campaign phone link href omits /vap/
[untestable-ui:IS-N102] Native date input rejects non-ISO text
[env-precondition] No telephony accounts — existing account option disabled
[manual] Requires valid Plivo credentials
```

Helpers: [`e2e/helpers/skip.ts`](helpers/skip.ts)

```ts
import { skipKnownIssue, skipProductGap, skipEnvPrecondition } from "../../../../helpers/skip";

test("…", async ({}, testInfo) => {
  skipKnownIssue(testInfo, "IS-N102"); // permanent untestable
});

// Runtime detection:
if (createdDespiteDuplicates) skipProductGap(testInfo, "PT-N107");
```

## How you know it's a real stage issue

1. **Test fails on staging** with a user-realistic action (click, fill, select) — likely **product-gap** → add to registry, keep failing or explicit skip.
2. **Same test passes after product fix** — remove skip / registry entry.
3. **Only fails on reload/direct URL, sidebar works** — **staging-infra** → navigation helper, not a product ticket.
4. **Skip reason has no `[category:id]`** — run audit; add registry entry or fix the test.

## Commands

```bash
npm run issues:audit          # validate tagged ids
npm run sheet:update          # skip reasons flow to Google Sheet
```

## Open product gaps (maintain this list in known-issues.mjs)

See `KNOWN_ISSUES` in [`e2e/data/known-issues.mjs`](data/known-issues.mjs). Re-run `npm run issues:audit` after changes.
