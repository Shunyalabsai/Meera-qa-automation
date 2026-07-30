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

  if (rowMeta.length > 1) {
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
