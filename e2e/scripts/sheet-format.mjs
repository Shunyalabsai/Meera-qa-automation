/**
 * Google Sheet visual formatting — colors, hyperlinks, row metadata.
 */

export const COLORS = {
  headerBg: { red: 0.12, green: 0.31, blue: 0.47 },
  headerFg: { red: 1, green: 1, blue: 1 },
  separatorBg: { red: 0.85, green: 0.85, blue: 0.85 },
  separatorFg: { red: 0.25, green: 0.25, blue: 0.25 },
  failBg: { red: 0.98, green: 0.78, blue: 0.76 },
  failFg: { red: 0.6, green: 0.1, blue: 0.1 },
  passBg: { red: 0.85, green: 0.94, blue: 0.85 },
  skipBg: { red: 0.98, green: 0.95, blue: 0.82 },
  journeyNewUser: { red: 0.89, green: 0.95, blue: 1 },
  journeyExisting: { red: 0.93, green: 0.89, blue: 0.98 },
  white: { red: 1, green: 1, blue: 1 },
};

export function repoBaseUrl() {
  const raw =
    process.env.GOOGLE_SHEET_REPO_URL ??
    process.env.GITHUB_REPO_URL ??
    "";
  return raw.replace(/\/$/, "");
}

export function escapeFormulaString(value) {
  return String(value ?? "").replace(/"/g, '""');
}

export function hyperlinkCell(url, label) {
  if (!url) return label ?? "";
  const safeUrl = escapeFormulaString(url);
  const safeLabel = escapeFormulaString(label ?? url);
  return `=HYPERLINK("${safeUrl}", "${safeLabel}")`;
}

/** @param {{ tags?: string, describe?: string, specFile?: string, rawTitle?: string }} row */
export function detectTestJourney(row) {
  const text = `${row.tags ?? ""} ${row.describe ?? ""} ${row.specFile ?? ""} ${row.rawTitle ?? ""}`;
  if (/@existing-user|\/existing-user\//i.test(text)) return "Existing User";
  if (/@new-user/i.test(text)) return "New User";
  return "General";
}

/** Infer run-level journey label from executed rows or env override. */
export function detectRunJourney(runRows) {
  const override = process.env.E2E_SHEET_RUN_JOURNEY?.trim();
  if (override) return override;

  const counts = { "New User": 0, "Existing User": 0, General: 0 };
  for (const row of runRows) {
    const j = row.journey ?? detectTestJourney(row);
    counts[j] = (counts[j] ?? 0) + 1;
  }
  const total = runRows.length || 1;
  if (counts["New User"] / total >= 0.6) return "New User";
  if (counts["Existing User"] / total >= 0.6) return "Existing User";
  if (counts["New User"] > counts["Existing User"] && counts["New User"] > 0) {
    return "New User (partial)";
  }
  if (counts["Existing User"] > counts["New User"] && counts["Existing User"] > 0) {
    return "Existing User (partial)";
  }
  return "Full Suite";
}

export function githubSpecUrl(specFile, line) {
  const base = repoBaseUrl();
  if (!base || !specFile) return "";
  const path = specFile.replace(/^\//, "");
  const anchor = line ? `#L${line}` : "";
  return `${base}/blob/main/${path}${anchor}`;
}

export function statusFillColor(status) {
  if (status === "Fail" || status === "Interrupted") {
    return { bg: COLORS.failBg, fg: COLORS.failFg };
  }
  if (status === "Skipped") return { bg: COLORS.skipBg, fg: null };
  if (status === "Pass") return { bg: COLORS.passBg, fg: null };
  return { bg: COLORS.white, fg: null };
}

export function journeyFillColor(journey) {
  if (journey === "New User") return COLORS.journeyNewUser;
  if (journey === "Existing User") return COLORS.journeyExisting;
  return null;
}

  /** Build repeatCell requests for one tab from parallel rowMeta. */
export function buildFormatRequests(sheetId, rowMeta, columnCount) {
  const requests = [];

  if (!rowMeta?.length) return requests;

  // A leftover filter from a previous publish blocks merging title/section rows.
  requests.push({ clearBasicFilter: { sheetId } });

  requests.push({
    updateSheetProperties: {
      properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
      fields: "gridProperties.frozenRowCount",
    },
  });

  for (let rowIndex = 0; rowIndex < rowMeta.length; rowIndex++) {
    const meta = rowMeta[rowIndex];
    const range = {
      sheetId,
      startRowIndex: rowIndex,
      endRowIndex: rowIndex + 1,
      startColumnIndex: 0,
      endColumnIndex: columnCount,
    };

    if (meta.type === "title") {
      if (meta.merge) {
        requests.push({
          mergeCells: {
            range: {
              sheetId,
              startRowIndex: rowIndex,
              endRowIndex: rowIndex + 1,
              startColumnIndex: 0,
              endColumnIndex: columnCount,
            },
            mergeType: "MERGE_ALL",
          },
        });
      }
      requests.push({
        repeatCell: {
          range,
          cell: {
            userEnteredFormat: {
              backgroundColor: COLORS.headerBg,
              textFormat: {
                bold: true,
                foregroundColor: COLORS.headerFg,
                fontSize: 14,
              },
              horizontalAlignment: "LEFT",
              verticalAlignment: "MIDDLE",
            },
          },
          fields:
            "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)",
        },
      });
      continue;
    }

    if (meta.type === "section") {
      if (meta.merge) {
        requests.push({
          mergeCells: {
            range: {
              sheetId,
              startRowIndex: rowIndex,
              endRowIndex: rowIndex + 1,
              startColumnIndex: 0,
              endColumnIndex: columnCount,
            },
            mergeType: "MERGE_ALL",
          },
        });
      }
      requests.push({
        repeatCell: {
          range,
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.36, green: 0.55, blue: 0.72 },
              textFormat: {
                bold: true,
                foregroundColor: COLORS.white,
                fontSize: 11,
              },
              horizontalAlignment: "LEFT",
              verticalAlignment: "MIDDLE",
            },
          },
          fields:
            "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)",
        },
      });
      continue;
    }

    if (meta.type === "kv") {
      requests.push({
        repeatCell: {
          range: {
            sheetId,
            startRowIndex: rowIndex,
            endRowIndex: rowIndex + 1,
            startColumnIndex: 0,
            endColumnIndex: Math.min(2, columnCount),
          },
          cell: {
            userEnteredFormat: {
              textFormat: { bold: true, fontSize: 10 },
              verticalAlignment: "MIDDLE",
            },
          },
          fields: "userEnteredFormat(textFormat,verticalAlignment)",
        },
      });
      continue;
    }

    if (meta.type === "spacer") continue;

    if (meta.type === "header") {
      requests.push({
        repeatCell: {
          range,
          cell: {
            userEnteredFormat: {
              backgroundColor: COLORS.headerBg,
              textFormat: {
                bold: true,
                foregroundColor: COLORS.headerFg,
                fontSize: 10,
              },
              horizontalAlignment: "CENTER",
              verticalAlignment: "MIDDLE",
            },
          },
          fields:
            "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)",
        },
      });
      continue;
    }

    if (meta.type === "separator") {
      if (meta.merge) {
        requests.push({
          mergeCells: {
            range: {
              sheetId,
              startRowIndex: rowIndex,
              endRowIndex: rowIndex + 1,
              startColumnIndex: 0,
              endColumnIndex: columnCount,
            },
            mergeType: "MERGE_ALL",
          },
        });
      }
      requests.push({
        repeatCell: {
          range,
          cell: {
            userEnteredFormat: {
              backgroundColor: COLORS.separatorBg,
              textFormat: {
                bold: true,
                foregroundColor: COLORS.separatorFg,
                fontSize: 10,
              },
              horizontalAlignment: "LEFT",
            },
          },
          fields:
            "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)",
        },
      });
      continue;
    }

    if (meta.type === "data") {
      const { bg, fg } = statusFillColor(meta.status);
      const format = {
        backgroundColor: bg,
        textFormat: {
          fontSize: 10,
          ...(fg ? { foregroundColor: fg, bold: meta.status === "Fail" } : {}),
        },
        verticalAlignment: "TOP",
        wrapStrategy: "WRAP",
      };
      requests.push({
        repeatCell: {
          range,
          cell: { userEnteredFormat: format },
          fields:
            "userEnteredFormat(backgroundColor,textFormat,verticalAlignment,wrapStrategy)",
        },
      });

      const journeyColor = journeyFillColor(meta.journey);
      const journeyCol = meta.journeyColumnIndex;
      if (journeyColor != null && journeyCol >= 0) {
        requests.push({
          repeatCell: {
            range: {
              sheetId,
              startRowIndex: rowIndex,
              endRowIndex: rowIndex + 1,
              startColumnIndex: journeyCol,
              endColumnIndex: journeyCol + 1,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: journeyColor,
                textFormat: { bold: true, fontSize: 10 },
                horizontalAlignment: "CENTER",
              },
            },
            fields:
              "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)",
          },
        });
      }
    }
  }

  // Summary-style tabs (title/section rows) shouldn't have a filter over merged headers.
  const hasDashboardSections = rowMeta.some((m) =>
    ["title", "section"].includes(m.type),
  );
  if (rowMeta.length > 1 && !hasDashboardSections) {
    requests.push({
      setBasicFilter: {
        filter: {
          range: {
            sheetId,
            startRowIndex: 0,
            endRowIndex: rowMeta.length,
            startColumnIndex: 0,
            endColumnIndex: columnCount,
          },
        },
      },
    });
  }

  requests.push({
    autoResizeDimensions: {
      dimensions: {
        sheetId,
        dimension: "COLUMNS",
        startIndex: 0,
        endIndex: columnCount,
      },
    },
  });

  return requests;
}

export function runSeparatorLabel(entry) {
  const stats = entry.stats ?? {};
  const pass = stats.expected ?? stats.pass ?? 0;
  const fail = stats.unexpected ?? stats.fail ?? 0;
  const skip = stats.skipped ?? 0;
  const journey = entry.journey ?? "Full Suite";
  const durationMin = ((entry.stats?.durationMs ?? 0) / 60000).toFixed(2);
  return `▸ RUN ${entry.runAt}  |  ${journey}  |  ${entry.status?.toUpperCase() ?? ""}  |  Pass ${pass}  Fail ${fail}  Skip ${skip}  |  ${durationMin} min  |  ${entry.runId}`;
}

/* ------------------------------------------------------------------------- *
 * Plain-English readability helpers
 * ------------------------------------------------------------------------- */

/** Extract a locator's human description from a Playwright error's call log. */
export function extractLocatorFromError(raw) {
  const text = String(raw ?? "").replace(/\[[0-9;]*m/g, "");
  const m =
    text.match(/waiting for ([^\r\n]+)/i) ??
    text.match(/- (?:locator|selector): ([^\r\n]+)/i) ??
    null;
  if (!m) return "";
  const target = m[1].replace(/^page\./i, "").trim();
  // "getByRole('button', { name: 'Create Agent' })" → "Create Agent (button)"
  const nameMatch =
    target.match(/name:\s*['"]([^'"]+)['"]/i) ??
    target.match(/name:\s*\/([^/]+)\//i);
  const roleMatch = target.match(/getByRole\(\s*['"]([^'"]+)['"]/i);
  const roleWord = roleMatch
    ? { button: "button", link: "link", heading: "heading", textbox: "input field", checkbox: "checkbox", tab: "tab", combobox: "dropdown", listbox: "list" }[roleMatch[1].toLowerCase()] ?? roleMatch[1]
    : "";
  if (nameMatch) {
    return (
      nameMatch[1].replace(/\s+/g, " ").trim().slice(0, 80) +
      (roleWord ? ` (${roleWord})` : "")
    );
  }
  const textMatch = target.match(/getByText\(\s*['"]([^'"]+)['"]/i);
  if (textMatch) return textMatch[1].trim().slice(0, 80);
  if (roleMatch) return `a ${roleWord} control`;
  // CSS / id selectors e.g. #call-direction-select
  const cssMatch = target.match(/(?:locator|getByTestId)\(\s*['"]([^'"]+)['"]|#[a-zA-Z][\w-]*/);
  if (cssMatch) return (cssMatch[1] ?? cssMatch[0]).replace(/^#/, "").replace(/[-_]+/g, " ").trim().slice(0, 80);
  return target.replace(/[`'"]/g, "").trim().slice(0, 80);
}

/**
 * Convert a raw Playwright failure into a sentence a non-technical reviewer
 * can act on. Returns the friendly reason (no error codes / selectors).
 */
export function friendlyFailureReason(raw, status = "failed") {
  const text = String(raw ?? "")
    .replace(/\[[0-9;]*m/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) {
    return status === "skipped" ? "Skipped without a recorded reason" : "Test failed — no error details were recorded";
  }

  // Skipped with a registered [category:ID] explanation → show the summary.
  const skipMatch = text.match(/^\[[a-z-]+:[A-Z0-9-]+\]\s*(.+)$/i);
  if (status === "skipped" && skipMatch) {
    return skipMatch[1].trim().replace(/^Skipped[:\s]+/i, "").replace(/[.;]?\s*$/, ".");
  }

  const locator = extractLocatorFromError(text);
  const target = locator ? `“${locator}”` : "";
  const control = target || "a control";

  // Network / page-load failures
  if (/net::ERR_CONNECTION_REFUSED/.test(text)) {
    return "The application server refused the connection — the app may be down or restarting. Re-run the test once the server is healthy.";
  }
  if (/net::ERR_CONNECTION_TIMED_OUT|navigation timeout/i.test(text)) {
    return "The application took too long to load (network timeout). The page may be slow or the server unreachable.";
  }
  if (/net::ERR_NAME_NOT_RESOLVED/.test(text)) {
    return "The application's web address could not be found (DNS error).";
  }
  if (/net::ERR_ABORTED/.test(text)) {
    return "A page navigation was interrupted (aborted). This often happens when the app redirects mid-load.";
  }
  if (/ERR_TUNNEL_CONNECTION_FAILED|ERR_SSL|ERR_CERT/.test(text)) {
    return "A secure connection (SSL) problem prevented the page from loading.";
  }

  // Timeouts — the single most common failure class
  const timeoutMatch = text.match(/Timeout\s+(\d+)\s*ms\s+exceeded|timeout of (\d+)ms exceeded/i);
  const timeoutMs = timeoutMatch ? Number(timeoutMatch[1] ?? timeoutMatch[2]) : 0;
  const timeoutLabel = timeoutMs
    ? `${Math.round(timeoutMs / 1000)} second(s)`
    : "the time limit";
  if (/locator\.click/.test(text) && timeoutMatch) {
    return `The test timed out (${timeoutLabel}) while waiting to click ${target || "an element"}. It never became available — the page may have loaded slowly, an earlier step failed, or the UI changed.`;
  }
  if (/locator\.(fill|press|type|selectOption)/.test(text) && timeoutMatch) {
    return `The test timed out (${timeoutLabel}) while trying to interact with ${target || "a form field"}. The input was not found or not ready — the page may not have finished loading.`;
  }
  if (/locator\.(waitFor|isVisible)/.test(text) && timeoutMatch) {
    return `The test timed out (${timeoutLabel}) waiting for ${target || "an element"} to appear on the page.`;
  }
  if (/expect\([^)]*\)\.toBeVisible/.test(text)) {
    return target
      ? `Expected ${target} to be visible on the page, but it was not found or was hidden. Check whether the page loaded and whether the UI still matches the test.`
      : "An element the test expected to be visible was not found on the page. Check whether the page loaded correctly.";
  }
  if (/expect\([^)]*\)\.toBeHidden/.test(text)) {
    return target
      ? `Expected ${target} to be hidden (e.g. a modal closed, a message dismissed), but it was still visible.`
      : "Something the test expected to disappear (a modal, a message) was still visible on the page.";
  }
  if (/expect\([^)]*\)\.toBeDisabled/.test(text)) {
    return `Expected ${control} to stay disabled (form validation should block submission), but it became enabled. This is a validation gap.`;
  }
  if (/expect\([^)]*\)\.toBeEnabled/.test(text)) {
    return `Expected ${control} to be enabled, but it was still disabled.`;
  }
  if (/expect\([^)]*\)\.toBeChecked/.test(text)) {
    return `Expected a checkbox/radio to be checked${target ? ` (around ${target})` : ""}, but it was not.`;
  }
  if (/expect\([^)]*\)\.toContainText/.test(text)) {
    return target
      ? `Expected some text to contain “${locator}”, but the actual text did not match.`
      : "The text shown on the page did not contain what the test expected to see.";
  }
  if (/expect\([^)]*\)\.toHaveCount/.test(text)) {
    return `The wrong number of matching items was found on the page.`;
  }
  if (/Page.goto|page\.goto/.test(text)) {
    return `The test could not open the requested page.`;
  }
  if (/Target closed|page closed|browser has been closed/i.test(text)) {
    return "The browser tab closed unexpectedly while the test was running (crash or navigation).";
  }
  if (/strict mode violation/i.test(text)) {
    return "The test found more than one matching element on the page (e.g. two buttons with the same label) and could not tell which to use.";
  }
  if (/page\.waitForResponse/.test(text)) {
    return "The page never returned the expected background request (e.g. saving data or loading a list). The network call may have failed.";
  }
  if (/intercepted|cancelled/i.test(text)) {
    return "A network request was cancelled before completing.";
  }
  if (/navigated to a different page|frame was detached/i.test(text)) {
    return "The page navigated or re-rendered while the test was interacting with it, so the previous element became invalid.";
  }
  if (/detached/i.test(text)) {
    return "The element the test was using disappeared from the page (the UI re-rendered mid-interaction).";
  }
  if (/is not a function|Cannot read properties of undefined|is undefined/i.test(text)) {
    return "A JavaScript error in the application stopped the page from working correctly.";
  }

  // Fallback: clean first sentence of the raw error, minus stack trace noise.
  const firstLine = text.split(/(?<=\.)\s+(?:Call log|at |Error:)/i)[0] ?? text;
  return firstLine.replace(/^Error:\s*/i, "").replace(/Call log.*$/i, "").replace(/[.;]?\s*$/, ".").slice(0, 220) || "Test failed — see the technical details.";
}

/**
 * Keep the raw error but make it readable for engineers: ANSI stripped,
 * whitespace collapsed, capped length, key lines preserved.
 */
export function cleanTechnicalError(raw, { maxLen = 600 } = {}) {
  const text = String(raw ?? "")
    .replace(/\[[0-9;]*m/g, "")
    .replace(/\r\n/g, "\n")
    .trim();
  if (!text) return "";
  // Drop the noisy "Call log" / stack trace tail after the first message.
  const lines = text.split("\n");
  const kept = [];
  for (const line of lines) {
    const t = line.trim();
    if (/^(at |Call log:|  -)/.test(t)) continue;
    if (t.startsWith("expect(received)") && kept.length) break;
    kept.push(t);
  }
  let clean = kept.join(" ").replace(/\s+/g, " ").trim();
  if (clean.length > maxLen) clean = clean.slice(0, maxLen - 1) + "…";
  return clean;
}

const MODULE_PREFIX_MAP = {
  BUILD: "Agent Builder",
  RUN: "Run",
  ANALYZE: "Analyze",
  SETTINGS: "Settings",
  AUTHENTICATION: "Authentication",
  GLOBAL: "Global UI",
  WORKSPACE: "Workspace",
  QA: "QA Registry",
};

/** "BUILD › Agents — List & detail @journey @new-user" → "Agent Builder › Agents". */
export function friendlyModule(describe = "", sectionKey = "") {
  const prefix =
    MODULE_PREFIX_MAP[String(sectionKey ?? "").toUpperCase()] ?? sectionKey ?? "";
  let raw = String(describe ?? "")
    .replace(/\s+@[\w-]+/g, " ")
    .replace(/\s*—\s*/g, " › ")
    .replace(/\s*[-–]\s*(List & detail|Detail|Main UI|Templates?)\b/gi, "")
    .replace(/\s*(List & detail|Detail|Main UI)\b/gi, "")
    .replace(/›\s*›/g, "›")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[›|]\s*$/g, "")
    .trim();

  const firstToken = raw.split(/[›|]/)[0].trim().toUpperCase();
  if (MODULE_PREFIX_MAP[firstToken]) {
    raw = raw.replace(new RegExp(`^${firstToken}`, "i"), prefix);
  } else if (prefix) {
    raw = `${prefix} › ${raw}`;
  }
  return raw || prefix;
}

/**
 * Human "how to test" for one result row.
 * Uses the manual sheet's real numbered steps when the TC ID is registered;
 * otherwise a plain, honest pointer at the automated spec.
 */
export function friendlyStepsForTest({ manual, title, module, specFile, line }) {
  if (manual?.steps) return manual.steps;
  const what = String(title ?? "").replace(/[.;]?\s*$/, "").toLowerCase();
  const url = githubSpecUrl(specFile, line);
  const specRef = url ? hyperlinkCell(url, "test code") : "the linked test code";
  return `Automated test — opens ${module || "the page"} and verifies: “${what}”. Exact clicks and assertions are in ${specRef}.`;
}

/** Expected result for one row — manual value when registered, else the title (which is an outcome statement). */
export function friendlyExpected({ manual, title, status }) {
  if (manual?.expected) return manual.expected;
  if (status === "Pass") return String(title ?? "").replace(/[.;]?\s*$/, "");
  if (status === "Fail") return "The check above should pass — see the failure reason for what went wrong.";
  return String(title ?? "").replace(/[.;]?\s*$/, "");
}
