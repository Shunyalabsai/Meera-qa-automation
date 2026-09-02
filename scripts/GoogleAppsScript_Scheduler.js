/**
 * ============================================================================
 * GOOGLE APPS SCRIPT (GAS) QA AUTOMATION & SCHEDULER ENGINE
 * ============================================================================
 *
 * Supported Projects:
 * 1. Meera Voice Agent Platform (Meera_repo)
 * 2. Playground UI & API Testing (playground-testing)
 * 3. ASR & TTS Backend QA Suite (asr-testing-v2)
 *
 * Capabilities:
 * - Time-Driven Triggers: Executes daily at 4:00 AM and 5:00 PM IST automatically.
 * - Cloud Dispatch: Triggers GitHub Actions workflows via repository_dispatch.
 * - Dashboard & Sheet Management: Updates Summary metrics, formats status badges,
 *   and archives test run history in Google Sheets.
 * - Webhook Endpoint (Web App): Receives real-time test completion webhooks (doPost/doGet).
 * ============================================================================
 */

// ==========================================
// 1. CONFIGURATION
// ==========================================
var CONFIG = {
  // Timezone for all scheduled triggers and logs
  TIMEZONE: 'Asia/Kolkata',

  // Active Project (switch to 'MEERA', 'PLAYGROUND', or 'ASR_TTS')
  ACTIVE_PROJECT: 'MEERA',

  // Project Specific Settings
  PROJECTS: {
    MEERA: {
      NAME: 'Meera Voice Agent Platform QA',
      GITHUB_OWNER: 'yamini-pal-singh',
      GITHUB_REPO: 'Meera_repo',
      SPREADSHEET_ID: '1MgzIeVQOLdquLraUnPH33vm-MvWBcijYmIZerHMG7Ro',
      DASHBOARD_URL: 'https://yamini-pal-singh.github.io/Meera_repo/',
      EVENT_TYPE: 'meera_scheduled_run'
    },
    PLAYGROUND: {
      NAME: 'Playground Automated Testing',
      GITHUB_OWNER: 'yamini-pal-singh',
      GITHUB_REPO: 'playground-testing',
      SPREADSHEET_ID: '11leUutfqP4OXyIIaeTYqw_3gWc1w5fQLnQWuUHXPgW4',
      DASHBOARD_URL: 'https://yamini-pal-singh.github.io/playground-testing/',
      EVENT_TYPE: 'scheduled_daily_run'
    },
    ASR_TTS: {
      NAME: 'ASR & TTS Backend QA',
      GITHUB_OWNER: 'Shunyalabsai',
      GITHUB_REPO: 'asr-tts-backend-qa',
      SPREADSHEET_ID: '1hWphhqgyjlgQD39TtnlkpHasDm0Vks1ZmfGYWNicN9c',
      DASHBOARD_URL: 'https://shunyalabsai.github.io/asr-tts-backend-qa/',
      EVENT_TYPE: 'scheduled_daily_run'
    }
  },

  // GitHub Personal Access Token (stored in Script Properties: GITHUB_PAT)
  getGithubToken: function() {
    return PropertiesService.getScriptProperties().getProperty('GITHUB_PAT') || '';
  }
};

/**
 * ============================================================================
 * 2. TRIGGER SETUP (4:00 AM and 5:00 PM IST Daily)
 * ============================================================================
 * Run this function once from the Apps Script menu or editor to set up triggers.
 */
function setupDailyTriggers() {
  // Remove existing triggers for this handler to prevent duplicates
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'executeScheduledRun' ||
        triggers[i].getHandlerFunction() === 'executeAllProjectsScheduledRun') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  // Morning Trigger: 4:00 AM IST everyday
  ScriptApp.newTrigger('executeScheduledRun')
    .timeBased()
    .atHour(4)
    .nearMinute(0)
    .everyDays(1)
    .inTimezone(CONFIG.TIMEZONE)
    .create();

  // Evening Trigger: 5:00 PM (17:00) IST everyday
  ScriptApp.newTrigger('executeScheduledRun')
    .timeBased()
    .atHour(17)
    .nearMinute(0)
    .everyDays(1)
    .inTimezone(CONFIG.TIMEZONE)
    .create();

  Logger.log('✅ Daily triggers successfully installed for 4:00 AM and 5:00 PM (' + CONFIG.TIMEZONE + ')');
}

/**
 * ============================================================================
 * 3. SCHEDULED EXECUTION HANDLER
 * ============================================================================
 * Dispatches test workflow and updates the master Google Sheet dashboard.
 */
function executeScheduledRun() {
  var project = CONFIG.PROJECTS[CONFIG.ACTIVE_PROJECT] || CONFIG.PROJECTS.MEERA;
  var now = new Date();
  var timestampStr = Utilities.formatDate(now, CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
  var slot = (now.getHours() < 12) ? 'Morning Run (4:00 AM)' : 'Evening Run (5:00 PM)';

  Logger.log('🚀 Triggering [' + project.NAME + '] ' + slot + ' at ' + timestampStr);

  // 1. Dispatch GitHub Actions Workflow
  var triggered = triggerGitHubWorkflow(project, project.EVENT_TYPE, {
    trigger_slot: slot,
    triggered_at: timestampStr,
    source: 'Google Apps Script Scheduler'
  });

  // 2. Update Master Dashboard Sheet
  updateMasterDashboardStatus(project, timestampStr, slot, triggered ? 'TRIGGERED' : 'FAILED_TO_DISPATCH');
}

/**
 * Alternative: Run all configured projects at the scheduled slot
 */
function executeAllProjectsScheduledRun() {
  var keys = Object.keys(CONFIG.PROJECTS);
  for (var k = 0; k < keys.length; k++) {
    var key = keys[k];
    var project = CONFIG.PROJECTS[key];
    var now = new Date();
    var timestampStr = Utilities.formatDate(now, CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
    var slot = (now.getHours() < 12) ? 'Morning Run (4:00 AM)' : 'Evening Run (5:00 PM)';

    var triggered = triggerGitHubWorkflow(project, project.EVENT_TYPE, {
      trigger_slot: slot,
      triggered_at: timestampStr,
      source: 'Google Apps Script Multi-Project Scheduler'
    });

    updateMasterDashboardStatus(project, timestampStr, slot, triggered ? 'TRIGGERED' : 'FAILED_TO_DISPATCH');
  }
}

/**
 * ============================================================================
 * 4. GITHUB ACTIONS API DISPATCH
 * ============================================================================
 */
function triggerGitHubWorkflow(project, eventType, clientPayload) {
  var token = CONFIG.getGithubToken();
  if (!token) {
    Logger.log('⚠️ GITHUB_PAT not found in Script Properties. Set it in Project Settings > Script Properties.');
    return false;
  }

  var url = 'https://api.github.com/repos/' + project.GITHUB_OWNER + '/' + project.GITHUB_REPO + '/dispatches';
  var payload = {
    event_type: eventType || 'scheduled_daily_run',
    client_payload: clientPayload || {}
  };

  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'token ' + token,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Google-Apps-Script-QA-Scheduler'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    if (code === 204 || code === 200 || code === 201) {
      Logger.log('✅ [' + project.NAME + '] GitHub Action workflow triggered successfully (HTTP ' + code + ')');
      return true;
    } else {
      Logger.log('❌ [' + project.NAME + '] GitHub Action trigger failed: HTTP ' + code + ' ' + response.getContentText());
      return false;
    }
  } catch (err) {
    Logger.log('❌ Exception during GitHub dispatch: ' + err.toString());
    return false;
  }
}

/**
 * ============================================================================
 * 5. MASTER DASHBOARD & GOOGLE SHEET FORMATTING ENGINE
 * ============================================================================
 */
function updateMasterDashboardStatus(project, timestamp, slot, status, details) {
  var ss;
  try {
    ss = SpreadsheetApp.openById(project.SPREADSHEET_ID);
  } catch (e) {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }
  if (!ss) {
    Logger.log('⚠️ Could not open spreadsheet: ' + project.SPREADSHEET_ID);
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
      'Status',
      'Pass Rate',
      'Passed / Total',
      'Dashboard URL',
      'Execution Details'
    ];
    sheet.appendRow(headers);
    sheet.getRange('A1:H1')
      .setFontWeight('bold')
      .setBackground('#0f172a')
      .setFontColor('#ffffff')
      .setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
  }

  // Prepare Record Row
  var passRate = (details && details.passRate !== undefined) ? details.passRate + '%' : '--';
  var counts = (details && details.passed !== undefined) ? (details.passed + ' / ' + details.total) : '--';
  var notes = (details && details.notes) ? details.notes : 'Auto-triggered by GAS Scheduler';

  // Insert newest row at Row 2 (top)
  sheet.insertRowBefore(2);
  var rowData = [
    timestamp,
    project.NAME,
    slot,
    status,
    passRate,
    counts,
    project.DASHBOARD_URL,
    notes
  ];

  var rowRange = sheet.getRange(2, 1, 1, 8);
  rowRange.setValues([rowData]);
  rowRange.setFontFamily('Arial').setFontSize(10).setVerticalAlignment('middle');

  // Format Status Badge
  var statusCell = sheet.getRange(2, 4);
  statusCell.setFontWeight('bold').setHorizontalAlignment('center');
  if (status === 'TRIGGERED' || status === 'PASSED' || status === 'SUCCESS') {
    statusCell.setBackground('#dcfce7').setFontColor('#15803d');
  } else if (status === 'FAILED' || status === 'FAILED_TO_DISPATCH') {
    statusCell.setBackground('#fee2e2').setFontColor('#b91c1c');
  } else {
    statusCell.setBackground('#fef3c7').setFontColor('#b45309');
  }

  // Border formatting for row separator
  rowRange.setBorder(null, null, true, null, null, null, '#cbd5e1', SpreadsheetApp.BorderStyle.SOLID);

  // Auto-resize columns for clean presentation
  for (var col = 1; col <= 8; col++) {
    sheet.autoResizeColumn(col);
  }

  Logger.log('📊 Dashboard sheet updated for ' + project.NAME);
}

/**
 * ============================================================================
 * 6. WEBHOOK RECEIVER (Web App doPost / doGet)
 * ============================================================================
 * Deploy as Web App to receive results from test runners and automatically
 * update the dashboard and sheets.
 */
function doPost(e) {
  try {
    var rawData = e.postData ? e.postData.contents : '{}';
    var data = JSON.parse(rawData);
    var now = new Date();
    var timestampStr = Utilities.formatDate(now, CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
    var slot = (now.getHours() < 12) ? 'Morning Run (4:00 AM)' : 'Evening Run (5:00 PM)';

    var projectKey = data.project || CONFIG.ACTIVE_PROJECT;
    var project = CONFIG.PROJECTS[projectKey] || CONFIG.PROJECTS.MEERA;

    var status = data.status || (data.failed === 0 ? 'PASSED' : 'FAILED');

    updateMasterDashboardStatus(project, timestampStr, slot, status, {
      passRate: data.passRate,
      passed: data.passed,
      total: data.total,
      notes: data.notes || 'Webhook result from test runner'
    });

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      timestamp: timestampStr,
      project: project.NAME,
      status: status
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'online',
    active_project: CONFIG.ACTIVE_PROJECT,
    timezone: CONFIG.TIMEZONE,
    schedule: '4:00 AM & 5:00 PM IST daily',
    version: '1.0.0'
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * ============================================================================
 * 7. SCRIPT CONFIGURATION HELPER
 * ============================================================================
 * Helper function to set your GitHub PAT in Script Properties directly
 */
function setGithubToken(personalAccessToken) {
  PropertiesService.getScriptProperties().setProperty('GITHUB_PAT', personalAccessToken);
  Logger.log('🔑 GITHUB_PAT property set successfully!');
}
