/**
 * ============================================================================
 * Google Apps Script (GAS) Automation & Scheduler Engine
 * Meera Voice Agent Platform (Shunyalabsai/Meera-qa-automation)
 * ============================================================================
 *
 * Capabilities:
 * 1. Time-Driven Triggers: Executes daily at 4:00 AM and 5:00 PM IST automatically in Google Cloud.
 * 2. GitHub Actions Dispatch: Triggers automated Playwright smoke test workflows via repository_dispatch.
 * 3. Master Dashboard & Sheet Logging: Updates execution status, pass rates, and history in Google Sheets.
 * 4. Zero Local Dependency: Runs entirely in Google Cloud without requiring Mac/local terminal to be open.
 * ============================================================================
 */

// ==========================================
// CONFIGURATION
// ==========================================
var CONFIG = {
  PROJECT_NAME: 'Meera Voice Agent Platform QA',
  GITHUB_OWNER: 'Shunyalabsai',
  GITHUB_REPO: 'Meera-qa-automation',
  // Stored in Apps Script: Project Settings > Script Properties > GITHUB_PAT
  GITHUB_TOKEN: PropertiesService.getScriptProperties().getProperty('GITHUB_PAT') || '',
  DASHBOARD_URL: 'https://shunyalabsai.github.io/Meera-qa-automation/',
  TIMEZONE: 'Asia/Kolkata',
  SPREADSHEET_ID: '1QbaJTyhdn1eNIIJkOFbglgyYkpffuN4I2GYUTrhcEvc',
  EVENT_TYPE: 'meera_scheduled_run'
};

/**
 * 1. Setup Time-Driven Triggers (4:00 AM & 5:00 PM IST Daily)
 * Run this function once from the Apps Script editor to register triggers.
 */
function setupDailyTriggers() {
  // Clear any existing triggers created by this script to prevent duplicates
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'executeScheduledRun') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  // 1. Morning Trigger: 4:00 AM IST
  ScriptApp.newTrigger('executeScheduledRun')
    .timeBased()
    .atHour(4)
    .nearMinute(0)
    .everyDays(1)
    .inTimezone(CONFIG.TIMEZONE)
    .create();

  // 2. Evening Trigger: 5:00 PM (17:00) IST
  ScriptApp.newTrigger('executeScheduledRun')
    .timeBased()
    .atHour(17)
    .nearMinute(0)
    .everyDays(1)
    .inTimezone(CONFIG.TIMEZONE)
    .create();

  Logger.log('✅ Daily triggers configured: 4:00 AM and 5:00 PM (' + CONFIG.TIMEZONE + ')');
}

/**
 * 2. Scheduled Run Handler (Dispatches GitHub Action & Logs Status)
 */
function executeScheduledRun() {
  var now = new Date();
  var timestampStr = Utilities.formatDate(now, CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
  var slot = (now.getHours() < 12) ? 'Morning Run (4:00 AM)' : 'Evening Run (5:00 PM)';

  Logger.log('🚀 Executing Scheduled Meera Test Trigger for ' + slot + ' at ' + timestampStr);

  // Trigger Cloud GitHub Actions Workflow
  var triggered = triggerGitHubWorkflow(CONFIG.EVENT_TYPE, {
    trigger_slot: slot,
    triggered_at: timestampStr,
    environment: 'production',
    source: 'Google Apps Script Cloud Scheduler'
  });

  // Log trigger status to Sheet
  updateMasterDashboardStatus(timestampStr, slot, triggered ? 'TRIGGERED' : 'FAILED_TO_DISPATCH');
}

/**
 * 3. Trigger GitHub Actions Workflow via REST API (repository_dispatch)
 */
function triggerGitHubWorkflow(eventType, clientPayload) {
  var token = CONFIG.GITHUB_TOKEN;
  if (!token) {
    Logger.log('⚠️ GITHUB_PAT not configured in Script Properties. Skipping GitHub dispatch.');
    return false;
  }

  var url = 'https://api.github.com/repos/' + CONFIG.GITHUB_OWNER + '/' + CONFIG.GITHUB_REPO + '/dispatches';
  var payload = {
    event_type: eventType || 'meera_scheduled_run',
    client_payload: clientPayload || {}
  };

  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'token ' + token,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Google-Apps-Script-Scheduler'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    if (code === 204 || code === 200 || code === 201) {
      Logger.log('✅ Successfully triggered GitHub Actions workflow (' + code + ') for ' + CONFIG.GITHUB_OWNER + '/' + CONFIG.GITHUB_REPO);
      return true;
    } else {
      Logger.log('❌ Failed to trigger workflow. HTTP ' + code + ': ' + response.getContentText());
      return false;
    }
  } catch (err) {
    Logger.log('❌ Error dispatching to GitHub: ' + err.toString());
    return false;
  }
}

/**
 * 4. Master Dashboard & Execution History Sheet Logging
 */
function updateMasterDashboardStatus(timestamp, slot, status, details) {
  var ss;
  try {
    ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  } catch (e) {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }
  if (!ss) {
    Logger.log('⚠️ Could not open spreadsheet: ' + CONFIG.SPREADSHEET_ID);
    return;
  }

  var sheetName = 'Execution History';
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  // Initialize Header if empty
  if (sheet.getLastRow() === 0) {
    var headers = [
      'Timestamp (IST)',
      'Project',
      'Scheduled Slot',
      'Trigger Status',
      'Pass Rate',
      'Passed / Total',
      'Dashboard URL',
      'Notes'
    ];
    sheet.appendRow(headers);
    sheet.getRange('A1:H1')
      .setFontWeight('bold')
      .setBackground('#0f172a')
      .setFontColor('#ffffff')
      .setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
  }

  var passRate = (details && details.passRate !== undefined) ? details.passRate + '%' : '--';
  var counts = (details && details.passed !== undefined) ? (details.passed + ' / ' + details.total) : '--';
  var notes = (details && details.notes) ? details.notes : 'Auto-triggered by Cloud Apps Script';

  // Insert latest execution record at Row 2 (top)
  sheet.insertRowBefore(2);
  var rowData = [
    timestamp,
    CONFIG.PROJECT_NAME,
    slot,
    status,
    passRate,
    counts,
    CONFIG.DASHBOARD_URL,
    notes
  ];
  sheet.getRange(2, 1, 1, 8).setValues([rowData]);

  // Apply Status Colors
  var statusCell = sheet.getRange(2, 4);
  if (status === 'TRIGGERED' || status === 'SUCCESS') {
    statusCell.setBackground('#dcfce7').setFontColor('#15803d').setFontWeight('bold');
  } else {
    statusCell.setBackground('#fee2e2').setFontColor('#b91c1c').setFontWeight('bold');
  }

  sheet.getRange(2, 1, 1, 8).setBorder(null, null, true, null, null, null, '#cbd5e1', SpreadsheetApp.BorderStyle.SOLID);
}

/**
 * 5. Manual Test Function
 * Run this function from Apps Script editor to immediately test GitHub dispatch.
 */
function testManualTrigger() {
  Logger.log('🧪 Testing manual trigger to GitHub Actions...');
  executeScheduledRun();
}

/**
 * 6. Webhook Endpoint: Handles incoming POST requests from Test Runners/Playwright
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var now = new Date();
    var timestampStr = Utilities.formatDate(now, CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
    var slot = (now.getHours() < 12) ? 'Morning Run (4:00 AM)' : 'Evening Run (5:00 PM)';

    if (data.type === 'TEST_COMPLETED') {
      updateMasterDashboardStatus(timestampStr, slot, data.status || 'COMPLETED', {
        passRate: data.passRate,
        passed: data.passed,
        total: data.total,
        notes: data.notes || 'Playwright smoke run completed'
      });
      return ContentService.createTextOutput(JSON.stringify({ status: 'ok', message: 'Dashboard updated' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
