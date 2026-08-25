#!/usr/bin/env node
/**
 * Populate all test cases from Manual QA, UAT Bug Log, and Automated Playwright Catalog
 * into the new consolidated Google Sheet with rich, colorful, and modern design.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import * as manual from "../data/manual-test-cases.mjs";
import * as uat from "../data/uat-cases.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
dotenv.config({ path: path.join(root, ".env") });

const TARGET_SHEET_ID = "1XOfZHu4ZRtGKvKv9BST-ubEEOjimIno7z6lNj6tZrok";
const credsPath = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || "./meera-500407-7ed504955ec2.json";
const creds = JSON.parse(fs.readFileSync(path.resolve(root, credsPath), "utf8"));
const catalog = JSON.parse(fs.readFileSync(path.join(root, "e2e/data/test-catalog.json"), "utf8"));

function hex(hexStr) {
  const c = hexStr.replace("#", "");
  return {
    red: parseInt(c.substring(0, 2), 16) / 255,
    green: parseInt(c.substring(2, 4), 16) / 255,
    blue: parseInt(c.substring(4, 6), 16) / 255,
  };
}

const PALETTE = {
  // Tab Header Accents
  headerOverview: hex("#312E81"),   // Deep Indigo
  headerManual: hex("#065F46"),     // Deep Emerald
  headerUat: hex("#5B21B6"),        // Deep Violet
  headerAuto: hex("#1E40AF"),       // Deep Blue
  headerText: hex("#FFFFFF"),

  // Tab Colors in Sheet Bar
  tabOverview: hex("#4F46E5"),
  tabManual: hex("#059669"),
  tabUat: hex("#7C3AED"),
  tabAuto: hex("#2563EB"),

  // Row zebra
  rowWhite: hex("#FFFFFF"),
  rowZebra: hex("#F8FAFC"),
  idBg: hex("#F1F5F9"),
  idText: hex("#1E293B"),

  // Priorities
  priorityHighBg: hex("#FEE2E2"),
  priorityHighText: hex("#991B1B"),
  priorityMedBg: hex("#FEF3C7"),
  priorityMedText: hex("#92400E"),
  priorityLowBg: hex("#E0F2FE"),
  priorityLowText: hex("#075985"),

  // Types
  typePositiveBg: hex("#D1FAE5"),
  typePositiveText: hex("#065F46"),
  typeNegativeBg: hex("#FFE4E6"),
  typeNegativeText: hex("#9F1239"),
  typeEdgeBg: hex("#EDE9FE"),
  typeEdgeText: hex("#5B21B6"),
  typeSuggestionBg: hex("#CFFAFE"),
  typeSuggestionText: hex("#155E75"),
  typeUiBg: hex("#E0E7FF"),
  typeUiText: hex("#3730A3"),
  typeJourneyBg: hex("#FEF9C3"),
  typeJourneyText: hex("#854D0E"),

  // Modules / Tabs
  modBuildBg: hex("#E0E7FF"),
  modBuildText: hex("#3730A3"),
  modAnalyzeBg: hex("#E0F2FE"),
  modAnalyzeText: hex("#0369A1"),
  modRunBg: hex("#DCFCE7"),
  modRunText: hex("#15803D"),
  modSettingsBg: hex("#FEF3C7"),
  modSettingsText: hex("#B45309"),
  modAuthBg: hex("#FFE4E6"),
  modAuthText: hex("#BE123C"),
  modGlobalBg: hex("#F3E8FF"),
  modGlobalText: hex("#7E22CE"),
  modExistingUserBg: hex("#CCFBF1"),
  modExistingUserText: hex("#0F766E"),
  modWorkspaceBg: hex("#F1F5F9"),
  modWorkspaceText: hex("#475569"),

  // Dev Status
  statusDoneBg: hex("#DCFCE7"),
  statusDoneText: hex("#15803D"),
  statusInProgressBg: hex("#FEF3C7"),
  statusInProgressText: hex("#B45309"),
  statusNotStartedBg: hex("#F1F5F9"),
  statusNotStartedText: hex("#475569"),
  statusSuggestionBg: hex("#EDE9FE"),
  statusSuggestionText: hex("#6D28D9"),

  // Overview Stats
  kpiBlueBg: hex("#EFF6FF"),
  kpiBlueText: hex("#1D4ED8"),
  kpiEmeraldBg: hex("#ECFDF5"),
  kpiEmeraldText: hex("#047857"),
  kpiPurpleBg: hex("#FAF5FF"),
  kpiPurpleText: hex("#6D28D9"),
  kpiIndigoBg: hex("#EEF2FF"),
  kpiIndigoText: hex("#4338CA"),
};

function b64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function getAccessToken(credentials) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = b64url(
    JSON.stringify({
      iss: credentials.client_email,
      scope: "https://www.googleapis.com/auth/spreadsheets",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const signInput = `${header}.${payload}`;
  const sign = crypto.sign("RSA-SHA256", Buffer.from(signInput), credentials.private_key);
  const jwt = `${signInput}.${b64url(sign)}`;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
  });
  if (!res.ok) throw new Error("Auth failed: " + res.status + " " + await res.text());
  return (await res.json()).access_token;
}

async function run() {
  const token = await getAccessToken(creds);
  console.log("Authenticated with Google Sheets API.");

  // 1. Fetch current spreadsheet metadata
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${TARGET_SHEET_ID}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const meta = await metaRes.json();
  const existingSheets = meta.sheets.map(s => ({ id: s.properties.sheetId, title: s.properties.title }));
  console.log("Current tabs in target sheet:", existingSheets.map(s => s.title));

  const tabDefs = [
    { title: "Overview", tabColor: PALETTE.tabOverview },
    { title: "Manual QA Cases", tabColor: PALETTE.tabManual },
    { title: "UAT Cases", tabColor: PALETTE.tabUat },
    { title: "Automated Catalog", tabColor: PALETTE.tabAuto },
  ];

  // 2. Add required tabs if missing
  const addRequests = [];
  for (const def of tabDefs) {
    if (!existingSheets.find(s => s.title === def.title)) {
      addRequests.push({
        addSheet: {
          properties: {
            title: def.title,
            tabColorStyle: { rgbColor: def.tabColor }
          }
        }
      });
    }
  }

  if (addRequests.length > 0) {
    console.log(`Adding ${addRequests.length} new tabs...`);
    const addRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${TARGET_SHEET_ID}:batchUpdate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ requests: addRequests })
    });
    if (!addRes.ok) throw new Error("Failed to add sheets: " + await addRes.text());
  }

  // 3. Re-read sheet metadata to get exact sheet IDs
  const metaRes2 = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${TARGET_SHEET_ID}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const meta2 = await metaRes2.json();
  const sheetMap = {};
  meta2.sheets.forEach(s => {
    sheetMap[s.properties.title] = s.properties.sheetId;
  });

  // 4. Prepare data payloads
  const manualCount = Object.keys(manual.MANUAL_TEST_CASES).length;
  const uatCount = uat.UAT_CASES.length;
  const autoCount = catalog.tests.length;
  const totalCount = manualCount + uatCount + autoCount;

  // Tab 1: Overview Dashboard
  const overviewRows = [
    ["✨ SHUNYALABS MEERA QA — MASTER TEST CASE REPOSITORY", "", "", "", ""],
    ["Unified, colorful index of all test cases across Manual QA, UAT Bug Feedback, and Automated E2E Test Suites.", "", "", "", ""],
    ["", "", "", "", ""],
    ["📊 EXECUTIVE TEST INVENTORY KPI SUMMARY", "", "", "", ""],
    ["KPI Metric", "Count", "Source Identifier", "Coverage Description", "Primary Focus"],
    ["🌟 Total Platform Inventory", String(totalCount), "All 3 Input Streams", "100% Comprehensive Platform Coverage", "All Modules & Features"],
    ["📋 Manual QA Test Cases", String(manualCount), "Meera_VAP_QA_TestCases", "Step-by-step human verification cases", "Preconditions, Steps & Results"],
    ["🐞 UAT & Feedback Cases", String(uatCount), "Meera_UAT_and_functional_july2026", "User acceptance bug log & edge findings", "Real user journeys & UX edge cases"],
    ["⚡ Automated Playwright Catalog", String(autoCount), "Playwright E2E Suite (242 Specs)", "Continuous regression test specifications", "Automated UI, API & Journeys"],
    ["", "", "", "", ""],
    ["📁 AUTOMATED TEST CATALOG BREAKDOWN BY MODULE", "", "", "", ""],
    ["Module / Tab Section", "Test Count", "Percentage Share", "Test Spec Scope", "Module Status"],
  ];

  const byModule = {};
  catalog.tests.forEach(t => {
    const mod = t.tab || t.sectionKey || "General";
    byModule[mod] = (byModule[mod] || 0) + 1;
  });

  const moduleColorsMap = {
    "BUILD": { bg: PALETTE.modBuildBg, text: PALETTE.modBuildText },
    "existing-user": { bg: PALETTE.modExistingUserBg, text: PALETTE.modExistingUserText },
    "SETTINGS": { bg: PALETTE.modSettingsBg, text: PALETTE.modSettingsText },
    "ANALYZE": { bg: PALETTE.modAnalyzeBg, text: PALETTE.modAnalyzeText },
    "RUN": { bg: PALETTE.modRunBg, text: PALETTE.modRunText },
    "Global UI": { bg: PALETTE.modGlobalBg, text: PALETTE.modGlobalText },
    "Authentication": { bg: PALETTE.modAuthBg, text: PALETTE.modAuthText },
    "Workspace": { bg: PALETTE.modWorkspaceBg, text: PALETTE.modWorkspaceText },
    "QA Registry": { bg: PALETTE.modWorkspaceBg, text: PALETTE.modWorkspaceText },
  };

  for (const [mod, count] of Object.entries(byModule)) {
    const pct = ((count / autoCount) * 100).toFixed(1) + "%";
    let desc = "Core Platform Module";
    if (mod === "BUILD") desc = "Agent Builder, Templates, Playground, Prompts";
    else if (mod === "existing-user") desc = "Lifecycle Journeys & Dropdown variations";
    else if (mod === "SETTINGS") desc = "Billing, Alerts, Webhooks, Roles, API keys";
    else if (mod === "ANALYZE") desc = "Call logs, Filters, Recordings, Insights";
    else if (mod === "RUN") desc = "Campaigns, Live Calls, Phone Numbers";
    else if (mod === "Global UI") desc = "Language Switcher, CTA Audits, Nav bar";
    else if (mod === "Authentication") desc = "Google SSO, Clerk Sign-In, Sign-Up";

    overviewRows.push([mod, String(count), pct, desc, "Active Coverage"]);
  }

  // Tab 2: Manual QA Cases
  const manualRows = [
    ["TC ID", "Module", "Test Name / Summary", "Preconditions", "Test Steps", "Expected Result", "Priority", "Type"]
  ];
  const manualDataList = Object.values(manual.MANUAL_TEST_CASES);
  for (const item of manualDataList) {
    manualRows.push([
      item.id || "",
      item.module || "",
      item.name || "",
      item.preconditions || "",
      item.steps || "",
      item.expected || "",
      item.priority || "",
      item.type || ""
    ]);
  }

  // Tab 3: UAT Cases
  const uatRows = [
    ["TC ID", "Test Scenario", "Preconditions", "Test Steps", "Expected Result / Suggestion", "Priority", "Test Case Type", "Reference", "Dev Status"]
  ];
  for (const row of uat.UAT_CASES) {
    uatRows.push(row.map(cell => String(cell ?? "")));
  }

  // Tab 4: Automated Catalog
  const catalogRows = [
    ["TC ID", "Section / Tab", "Describe Suite", "Test Title", "Priority", "Type", "Spec File", "Tags"]
  ];
  for (const t of catalog.tests) {
    catalogRows.push([
      t.id || "",
      t.tab || "",
      t.describe || "",
      t.title || "",
      t.priority || "",
      t.type || "",
      t.specFile || "",
      Array.isArray(t.tags) ? t.tags.join(", ") : ""
    ]);
  }

  // Clear existing ranges first to remove any leftover columns
  console.log("Clearing existing contents...");
  const clearRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${TARGET_SHEET_ID}/values:batchClear`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      ranges: [
        "'Overview'!A1:Z2000",
        "'Manual QA Cases'!A1:Z2000",
        "'UAT Cases'!A1:Z2000",
        "'Automated Catalog'!A1:Z2000",
      ]
    })
  });
  if (!clearRes.ok) console.warn("Clear warning:", await clearRes.text());

  // 5. Write Data via values.batchUpdate
  const valRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${TARGET_SHEET_ID}/values:batchUpdate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      valueInputOption: "USER_ENTERED",
      data: [
        { range: "'Overview'!A1:E" + overviewRows.length, values: overviewRows },
        { range: "'Manual QA Cases'!A1:H" + manualRows.length, values: manualRows },
        { range: "'UAT Cases'!A1:I" + uatRows.length, values: uatRows },
        { range: "'Automated Catalog'!A1:H" + catalogRows.length, values: catalogRows },
      ]
    })
  });
  if (!valRes.ok) throw new Error("Values update failed: " + await valRes.text());
  console.log("Data successfully written.");

  // 6. Formatting & Colorful Styling
  const formatRequests = [];

  // Delete Sheet1 if it exists
  const sheet1 = meta2.sheets.find(s => s.properties.title === "Sheet1");
  if (sheet1) {
    formatRequests.push({ deleteSheet: { sheetId: sheet1.properties.sheetId } });
  }

  // Set tab colors
  for (const def of tabDefs) {
    const sId = sheetMap[def.title];
    if (sId !== undefined) {
      formatRequests.push({
        updateSheetProperties: {
          properties: {
            sheetId: sId,
            tabColorStyle: { rgbColor: def.tabColor }
          },
          fields: "tabColorStyle"
        }
      });
    }
  }

  // Helper function to freeze header & set basic grid
  function setupTabHeader(sheetTitle, colCount, headerBgColor) {
    const sheetId = sheetMap[sheetTitle];
    if (sheetId === undefined) return;

    // Freeze header
    formatRequests.push({
      updateSheetProperties: {
        properties: {
          sheetId,
          gridProperties: { frozenRowCount: 1 }
        },
        fields: "gridProperties.frozenRowCount"
      }
    });

    // Header styling
    formatRequests.push({
      repeatCell: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: colCount },
        cell: {
          userEnteredFormat: {
            backgroundColor: headerBgColor,
            textFormat: { foregroundColor: PALETTE.headerText, bold: true, fontSize: 10 },
            horizontalAlignment: "CENTER",
            verticalAlignment: "MIDDLE",
            wrapStrategy: "WRAP"
          }
        },
        fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,wrapStrategy)"
      }
    });

    // Content default wrapping & font
    formatRequests.push({
      repeatCell: {
        range: { sheetId, startRowIndex: 1, startColumnIndex: 0, endColumnIndex: colCount },
        cell: {
          userEnteredFormat: {
            verticalAlignment: "MIDDLE",
            wrapStrategy: "WRAP",
            textFormat: { fontSize: 9 }
          }
        },
        fields: "userEnteredFormat(verticalAlignment,wrapStrategy,textFormat.fontSize)"
      }
    });
  }

  setupTabHeader("Manual QA Cases", 8, PALETTE.headerManual);
  setupTabHeader("UAT Cases", 9, PALETTE.headerUat);
  setupTabHeader("Automated Catalog", 8, PALETTE.headerAuto);

  // Styling helper for Priority pills
  function getPriorityColor(val) {
    const p = String(val || "").toLowerCase();
    if (p.includes("high") || p.includes("p0") || p.includes("p1") || p.includes("critical")) {
      return { bg: PALETTE.priorityHighBg, text: PALETTE.priorityHighText };
    }
    if (p.includes("med") || p.includes("p2")) {
      return { bg: PALETTE.priorityMedBg, text: PALETTE.priorityMedText };
    }
    return { bg: PALETTE.priorityLowBg, text: PALETTE.priorityLowText };
  }

  // Styling helper for Type pills
  function getTypeColor(val) {
    const t = String(val || "").toLowerCase();
    if (t.includes("pos")) return { bg: PALETTE.typePositiveBg, text: PALETTE.typePositiveText };
    if (t.includes("neg")) return { bg: PALETTE.typeNegativeBg, text: PALETTE.typeNegativeText };
    if (t.includes("edge")) return { bg: PALETTE.typeEdgeBg, text: PALETTE.typeEdgeText };
    if (t.includes("sugg")) return { bg: PALETTE.typeSuggestionBg, text: PALETTE.typeSuggestionText };
    if (t.includes("ui")) return { bg: PALETTE.typeUiBg, text: PALETTE.typeUiText };
    if (t.includes("journey")) return { bg: PALETTE.typeJourneyBg, text: PALETTE.typeJourneyText };
    return { bg: PALETTE.idBg, text: PALETTE.idText };
  }

  // Styling helper for Module tags
  function getModuleColor(val) {
    const m = String(val || "").toUpperCase();
    if (m.includes("BUILD") || m.includes("AGENT")) return { bg: PALETTE.modBuildBg, text: PALETTE.modBuildText };
    if (m.includes("ANALYZE") || m.includes("CALL") || m.includes("INSIGHT")) return { bg: PALETTE.modAnalyzeBg, text: PALETTE.modAnalyzeText };
    if (m.includes("RUN") || m.includes("CAMPAIGN")) return { bg: PALETTE.modRunBg, text: PALETTE.modRunText };
    if (m.includes("SETTING") || m.includes("BILL") || m.includes("ALERT") || m.includes("WEBHOOK")) return { bg: PALETTE.modSettingsBg, text: PALETTE.modSettingsText };
    if (m.includes("AUTH") || m.includes("SIGN")) return { bg: PALETTE.modAuthBg, text: PALETTE.modAuthText };
    if (m.includes("GLOBAL") || m.includes("LANG")) return { bg: PALETTE.modGlobalBg, text: PALETTE.modGlobalText };
    if (m.includes("EXISTING") || m.includes("USER")) return { bg: PALETTE.modExistingUserBg, text: PALETTE.modExistingUserText };
    return { bg: PALETTE.modWorkspaceBg, text: PALETTE.modWorkspaceText };
  }

  // Styling helper for Dev Status
  function getStatusColor(val) {
    const s = String(val || "").toLowerCase();
    if (s.includes("done") || s.includes("fixed") || s.includes("resolved")) return { bg: PALETTE.statusDoneBg, text: PALETTE.statusDoneText };
    if (s.includes("progress") || s.includes("working")) return { bg: PALETTE.statusInProgressBg, text: PALETTE.statusInProgressText };
    if (s.includes("sugg")) return { bg: PALETTE.statusSuggestionBg, text: PALETTE.statusSuggestionText };
    return { bg: PALETTE.statusNotStartedBg, text: PALETTE.statusNotStartedText };
  }

  // Batch format individual cells in Manual QA Cases
  const manualId = sheetMap["Manual QA Cases"];
  if (manualId !== undefined) {
    // Zebra striping
    for (let r = 1; r < manualRows.length; r++) {
      const isEven = r % 2 === 0;
      const rowBg = isEven ? PALETTE.rowZebra : PALETTE.rowWhite;
      formatRequests.push({
        repeatCell: {
          range: { sheetId: manualId, startRowIndex: r, endRowIndex: r + 1, startColumnIndex: 0, endColumnIndex: 8 },
          cell: { userEnteredFormat: { backgroundColor: rowBg } },
          fields: "userEnteredFormat.backgroundColor"
        }
      });
    }

    // TC ID Column (Col 0) - Styled as bold badge
    formatRequests.push({
      repeatCell: {
        range: { sheetId: manualId, startRowIndex: 1, endRowIndex: manualRows.length, startColumnIndex: 0, endColumnIndex: 1 },
        cell: {
          userEnteredFormat: {
            backgroundColor: PALETTE.idBg,
            textFormat: { bold: true, foregroundColor: PALETTE.idText, fontSize: 9 },
            horizontalAlignment: "CENTER"
          }
        },
        fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)"
      }
    });

    // Module Column (Col 1), Priority (Col 6), Type (Col 7)
    manualDataList.forEach((item, idx) => {
      const r = idx + 1;
      const modCol = getModuleColor(item.module);
      const priCol = getPriorityColor(item.priority);
      const typCol = getTypeColor(item.type);

      // Module badge
      formatRequests.push({
        repeatCell: {
          range: { sheetId: manualId, startRowIndex: r, endRowIndex: r + 1, startColumnIndex: 1, endColumnIndex: 2 },
          cell: {
            userEnteredFormat: {
              backgroundColor: modCol.bg,
              textFormat: { bold: true, foregroundColor: modCol.text, fontSize: 9 },
              horizontalAlignment: "CENTER"
            }
          },
          fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)"
        }
      });

      // Priority badge
      formatRequests.push({
        repeatCell: {
          range: { sheetId: manualId, startRowIndex: r, endRowIndex: r + 1, startColumnIndex: 6, endColumnIndex: 7 },
          cell: {
            userEnteredFormat: {
              backgroundColor: priCol.bg,
              textFormat: { bold: true, foregroundColor: priCol.text, fontSize: 9 },
              horizontalAlignment: "CENTER"
            }
          },
          fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)"
        }
      });

      // Type badge
      formatRequests.push({
        repeatCell: {
          range: { sheetId: manualId, startRowIndex: r, endRowIndex: r + 1, startColumnIndex: 7, endColumnIndex: 8 },
          cell: {
            userEnteredFormat: {
              backgroundColor: typCol.bg,
              textFormat: { bold: true, foregroundColor: typCol.text, fontSize: 9 },
              horizontalAlignment: "CENTER"
            }
          },
          fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)"
        }
      });
    });
  }

  // Batch format UAT Cases
  const uatId = sheetMap["UAT Cases"];
  if (uatId !== undefined) {
    for (let r = 1; r < uatRows.length; r++) {
      const isEven = r % 2 === 0;
      const rowBg = isEven ? PALETTE.rowZebra : PALETTE.rowWhite;
      formatRequests.push({
        repeatCell: {
          range: { sheetId: uatId, startRowIndex: r, endRowIndex: r + 1, startColumnIndex: 0, endColumnIndex: 9 },
          cell: { userEnteredFormat: { backgroundColor: rowBg } },
          fields: "userEnteredFormat.backgroundColor"
        }
      });
    }

    // TC ID Column (Col 0)
    formatRequests.push({
      repeatCell: {
        range: { sheetId: uatId, startRowIndex: 1, endRowIndex: uatRows.length, startColumnIndex: 0, endColumnIndex: 1 },
        cell: {
          userEnteredFormat: {
            backgroundColor: PALETTE.idBg,
            textFormat: { bold: true, foregroundColor: PALETTE.idText, fontSize: 9 },
            horizontalAlignment: "CENTER"
          }
        },
        fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)"
      }
    });

    uat.UAT_CASES.forEach((row, idx) => {
      const r = idx + 1;
      const priCol = getPriorityColor(row[5]);
      const typCol = getTypeColor(row[6]);
      const statCol = getStatusColor(row[8]);

      // Priority (Col 5)
      formatRequests.push({
        repeatCell: {
          range: { sheetId: uatId, startRowIndex: r, endRowIndex: r + 1, startColumnIndex: 5, endColumnIndex: 6 },
          cell: {
            userEnteredFormat: {
              backgroundColor: priCol.bg,
              textFormat: { bold: true, foregroundColor: priCol.text, fontSize: 9 },
              horizontalAlignment: "CENTER"
            }
          },
          fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)"
        }
      });

      // Type (Col 6)
      formatRequests.push({
        repeatCell: {
          range: { sheetId: uatId, startRowIndex: r, endRowIndex: r + 1, startColumnIndex: 6, endColumnIndex: 7 },
          cell: {
            userEnteredFormat: {
              backgroundColor: typCol.bg,
              textFormat: { bold: true, foregroundColor: typCol.text, fontSize: 9 },
              horizontalAlignment: "CENTER"
            }
          },
          fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)"
        }
      });

      // Dev Status (Col 8)
      formatRequests.push({
        repeatCell: {
          range: { sheetId: uatId, startRowIndex: r, endRowIndex: r + 1, startColumnIndex: 8, endColumnIndex: 9 },
          cell: {
            userEnteredFormat: {
              backgroundColor: statCol.bg,
              textFormat: { bold: true, foregroundColor: statCol.text, fontSize: 9 },
              horizontalAlignment: "CENTER"
            }
          },
          fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)"
        }
      });
    });
  }

  // Batch format Automated Catalog
  const autoId = sheetMap["Automated Catalog"];
  if (autoId !== undefined) {
    // TC ID Column (Col 0)
    formatRequests.push({
      repeatCell: {
        range: { sheetId: autoId, startRowIndex: 1, endRowIndex: catalogRows.length, startColumnIndex: 0, endColumnIndex: 1 },
        cell: {
          userEnteredFormat: {
            backgroundColor: PALETTE.idBg,
            textFormat: { bold: true, foregroundColor: PALETTE.idText, fontSize: 9 },
            horizontalAlignment: "CENTER"
          }
        },
        fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)"
      }
    });

    // Priority (Col 4) conditional rule / batch
    formatRequests.push({
      repeatCell: {
        range: { sheetId: autoId, startRowIndex: 1, endRowIndex: catalogRows.length, startColumnIndex: 4, endColumnIndex: 5 },
        cell: {
          userEnteredFormat: {
            backgroundColor: PALETTE.priorityHighBg,
            textFormat: { bold: true, foregroundColor: PALETTE.priorityHighText, fontSize: 9 },
            horizontalAlignment: "CENTER"
          }
        },
        fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)"
      }
    });

    // Type (Col 5)
    formatRequests.push({
      repeatCell: {
        range: { sheetId: autoId, startRowIndex: 1, endRowIndex: catalogRows.length, startColumnIndex: 5, endColumnIndex: 6 },
        cell: {
          userEnteredFormat: {
            backgroundColor: PALETTE.typeUiBg,
            textFormat: { bold: true, foregroundColor: PALETTE.typeUiText, fontSize: 9 },
            horizontalAlignment: "CENTER"
          }
        },
        fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)"
      }
    });
  }

  // Overview Tab Styling
  const overviewId = sheetMap["Overview"];
  if (overviewId !== undefined) {
    // Main Title Bar: Deep Indigo with bold white text
    formatRequests.push({
      repeatCell: {
        range: { sheetId: overviewId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 5 },
        cell: {
          userEnteredFormat: {
            backgroundColor: PALETTE.headerOverview,
            textFormat: { foregroundColor: PALETTE.headerText, bold: true, fontSize: 13 },
            verticalAlignment: "MIDDLE"
          }
        },
        fields: "userEnteredFormat(backgroundColor,textFormat,verticalAlignment)"
      }
    });

    // Section 1 Header (KPI Summary)
    formatRequests.push({
      repeatCell: {
        range: { sheetId: overviewId, startRowIndex: 3, endRowIndex: 4, startColumnIndex: 0, endColumnIndex: 5 },
        cell: {
          userEnteredFormat: {
            backgroundColor: hex("#4338CA"),
            textFormat: { foregroundColor: hex("#FFFFFF"), bold: true, fontSize: 11 },
            verticalAlignment: "MIDDLE"
          }
        },
        fields: "userEnteredFormat(backgroundColor,textFormat,verticalAlignment)"
      }
    });

    // Table 1 Column Headers (Row 4)
    formatRequests.push({
      repeatCell: {
        range: { sheetId: overviewId, startRowIndex: 4, endRowIndex: 5, startColumnIndex: 0, endColumnIndex: 5 },
        cell: {
          userEnteredFormat: {
            backgroundColor: hex("#1E293B"),
            textFormat: { foregroundColor: hex("#FFFFFF"), bold: true, fontSize: 10 },
            verticalAlignment: "MIDDLE"
          }
        },
        fields: "userEnteredFormat(backgroundColor,textFormat,verticalAlignment)"
      }
    });

    // KPI Rows (Rows 5 to 8)
    const kpiStyles = [
      { bg: PALETTE.kpiBlueBg, text: PALETTE.kpiBlueText },
      { bg: PALETTE.kpiEmeraldBg, text: PALETTE.kpiEmeraldText },
      { bg: PALETTE.kpiPurpleBg, text: PALETTE.kpiPurpleText },
      { bg: PALETTE.kpiIndigoBg, text: PALETTE.kpiIndigoText },
    ];
    kpiStyles.forEach((st, idx) => {
      const r = 5 + idx;
      formatRequests.push({
        repeatCell: {
          range: { sheetId: overviewId, startRowIndex: r, endRowIndex: r + 1, startColumnIndex: 0, endColumnIndex: 5 },
          cell: {
            userEnteredFormat: {
              backgroundColor: st.bg,
              textFormat: { fontSize: 10, bold: idx === 0 },
              verticalAlignment: "MIDDLE"
            }
          },
          fields: "userEnteredFormat(backgroundColor,textFormat,verticalAlignment)"
        }
      });
      // Count column bold highlight
      formatRequests.push({
        repeatCell: {
          range: { sheetId: overviewId, startRowIndex: r, endRowIndex: r + 1, startColumnIndex: 1, endColumnIndex: 2 },
          cell: {
            userEnteredFormat: {
              textFormat: { bold: true, fontSize: 12, foregroundColor: st.text },
              horizontalAlignment: "CENTER"
            }
          },
          fields: "userEnteredFormat(textFormat,horizontalAlignment)"
        }
      });
    });

    // Section 2 Header (Breakdown)
    formatRequests.push({
      repeatCell: {
        range: { sheetId: overviewId, startRowIndex: 10, endRowIndex: 11, startColumnIndex: 0, endColumnIndex: 5 },
        cell: {
          userEnteredFormat: {
            backgroundColor: hex("#4338CA"),
            textFormat: { foregroundColor: hex("#FFFFFF"), bold: true, fontSize: 11 },
            verticalAlignment: "MIDDLE"
          }
        },
        fields: "userEnteredFormat(backgroundColor,textFormat,verticalAlignment)"
      }
    });

    // Table 2 Column Headers (Row 11)
    formatRequests.push({
      repeatCell: {
        range: { sheetId: overviewId, startRowIndex: 11, endRowIndex: 12, startColumnIndex: 0, endColumnIndex: 5 },
        cell: {
          userEnteredFormat: {
            backgroundColor: hex("#1E293B"),
            textFormat: { foregroundColor: hex("#FFFFFF"), bold: true, fontSize: 10 },
            verticalAlignment: "MIDDLE"
          }
        },
        fields: "userEnteredFormat(backgroundColor,textFormat,verticalAlignment)"
      }
    });

    // Module rows in Overview (Rows 12 to 12 + modules)
    const modEntries = Object.entries(byModule);
    modEntries.forEach(([mod, count], idx) => {
      const r = 12 + idx;
      const modSt = moduleColorsMap[mod] || { bg: PALETTE.rowZebra, text: PALETTE.idText };

      formatRequests.push({
        repeatCell: {
          range: { sheetId: overviewId, startRowIndex: r, endRowIndex: r + 1, startColumnIndex: 0, endColumnIndex: 1 },
          cell: {
            userEnteredFormat: {
              backgroundColor: modSt.bg,
              textFormat: { bold: true, foregroundColor: modSt.text, fontSize: 10 },
              horizontalAlignment: "CENTER",
              verticalAlignment: "MIDDLE"
            }
          },
          fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)"
        }
      });

      formatRequests.push({
        repeatCell: {
          range: { sheetId: overviewId, startRowIndex: r, endRowIndex: r + 1, startColumnIndex: 1, endColumnIndex: 3 },
          cell: {
            userEnteredFormat: {
              textFormat: { bold: true, fontSize: 10 },
              horizontalAlignment: "CENTER",
              verticalAlignment: "MIDDLE"
            }
          },
          fields: "userEnteredFormat(textFormat,horizontalAlignment,verticalAlignment)"
        }
      });
    });
  }

  // Set explicit column widths
  // Manual QA Cases
  if (sheetMap["Manual QA Cases"] !== undefined) {
    const id = sheetMap["Manual QA Cases"];
    const widths = [110, 190, 250, 200, 360, 360, 100, 100];
    widths.forEach((w, i) => {
      formatRequests.push({
        updateDimensionProperties: {
          range: { sheetId: id, dimension: "COLUMNS", startIndex: i, endIndex: i + 1 },
          properties: { pixelSize: w },
          fields: "pixelSize"
        }
      });
    });
  }

  // UAT Cases
  if (sheetMap["UAT Cases"] !== undefined) {
    const id = sheetMap["UAT Cases"];
    const widths = [100, 240, 180, 320, 360, 100, 120, 150, 120];
    widths.forEach((w, i) => {
      formatRequests.push({
        updateDimensionProperties: {
          range: { sheetId: id, dimension: "COLUMNS", startIndex: i, endIndex: i + 1 },
          properties: { pixelSize: w },
          fields: "pixelSize"
        }
      });
    });
  }

  // Automated Catalog
  if (sheetMap["Automated Catalog"] !== undefined) {
    const id = sheetMap["Automated Catalog"];
    const widths = [120, 140, 220, 320, 100, 90, 360, 220];
    widths.forEach((w, i) => {
      formatRequests.push({
        updateDimensionProperties: {
          range: { sheetId: id, dimension: "COLUMNS", startIndex: i, endIndex: i + 1 },
          properties: { pixelSize: w },
          fields: "pixelSize"
        }
      });
    });
  }

  // Overview widths
  if (overviewId !== undefined) {
    const widths = [260, 150, 170, 340, 260];
    widths.forEach((w, i) => {
      formatRequests.push({
        updateDimensionProperties: {
          range: { sheetId: overviewId, dimension: "COLUMNS", startIndex: i, endIndex: i + 1 },
          properties: { pixelSize: w },
          fields: "pixelSize"
        }
      });
    });
  }

  console.log(`Executing ${formatRequests.length} colorful formatting operations...`);
  // Send in chunks of 500 if large
  const CHUNK_SIZE = 400;
  for (let i = 0; i < formatRequests.length; i += CHUNK_SIZE) {
    const chunk = formatRequests.slice(i, i + CHUNK_SIZE);
    console.log(`Applying formatting chunk ${Math.floor(i / CHUNK_SIZE) + 1} of ${Math.ceil(formatRequests.length / CHUNK_SIZE)}...`);
    const formatRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${TARGET_SHEET_ID}:batchUpdate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ requests: chunk })
    });
    if (!formatRes.ok) throw new Error("Formatting failed: " + await formatRes.text());
  }

  console.log("\n SUCCESS! All test cases have been stored and gorgeously styled in the Google Sheet:");
  console.log(`https://docs.google.com/spreadsheets/d/${TARGET_SHEET_ID}/edit`);
}

run().catch(console.error);
