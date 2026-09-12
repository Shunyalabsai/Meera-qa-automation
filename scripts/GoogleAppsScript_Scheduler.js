/**
 * ============================================================================
 * Google Apps Script (GAS) Automation & Health Monitoring Engine
 * Meera Voice Agent Platform (Shunyalabsai/Meera-qa-automation)
 * ============================================================================
 *
 * Capabilities:
 * 1. 5-Minute API Health Probes: Probes entry point, JS bundle, and webhooks every 5 minutes.
 * 2. Instant Failure Alerting: Automatically emails yamini@shunyalabs.in if any API check fails.
 * 3. Daily Scheduled Smoke Suite (4:00 AM & 5:00 PM IST): Dispatches full smoke test runs.
 * 4. Master Dashboard Logging: Records execution history in Google Sheets.
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
  SMOKE_EVENT_TYPE: 'meera_scheduled_run',
  HEALTH_EVENT_TYPE: 'vap_health_check',
  ALERT_EMAIL: PropertiesService.getScriptProperties().getProperty('ALERT_EMAIL') || 'yamini@shunyalabs.in'
};

/**
 * ============================================================================
 * 1. 5-MINUTE API HEALTH CHECK & INSTANT EMAIL ALERTING
 * ============================================================================
 */

/**
 * Register 5-Minute Continuous Health Check Trigger
 * Run this function once from the Apps Script editor to start 5-minute health checks.
 */
function setup5MinHealthCheckTrigger() {
  // Clear any existing health check triggers to prevent duplicates
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'run5MinApiHealthCheck') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  ScriptApp.newTrigger('run5MinApiHealthCheck')
    .timeBased()
    .everyMinutes(5)
    .create();

  Logger.log('✅ 5-Minute API Health Check Trigger successfully registered in Google Cloud (Target: ' + CONFIG.ALERT_EMAIL + ')');
}

/**
 * Stop/Disable 5-Minute Health Check Trigger
 */
function disable5MinHealthCheckTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  var count = 0;
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'run5MinApiHealthCheck') {
      ScriptApp.deleteTrigger(triggers[i]);
      count++;
    }
  }
  Logger.log('🛑 Disabled ' + count + ' 5-minute health check trigger(s).');
}

/**
 * 5-Minute API Health Probe Handler
 * Probes the live endpoints and triggers an instant email alert if any probe fails.
 */
function run5MinApiHealthCheck() {
  var now = new Date();
  var timestamp = Utilities.formatDate(now, CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
  var failures = [];

  // Probe 1: Core Backend API Health Endpoint (/api/health)
  try {
    var apiRes = UrlFetchApp.fetch('https://agents.shunyalabs.ai/api/health', {
      muteHttpExceptions: true
    });
    var apiCode = apiRes.getResponseCode();
    if (apiCode !== 200) {
      failures.push({
        probe: 'Backend API Health (/api/health)',
        url: 'https://agents.shunyalabs.ai/api/health',
        status: 'HTTP ' + apiCode,
        error: 'Expected HTTP 200, received ' + apiCode
      });
    } else {
      var apiJson = JSON.parse(apiRes.getContentText());
      if (apiJson.status !== 'ok') {
        failures.push({
          probe: 'Backend API Health (/api/health)',
          url: 'https://agents.shunyalabs.ai/api/health',
          status: 'UNHEALTHY_PAYLOAD',
          error: 'Expected status "ok", received: ' + apiRes.getContentText()
        });
      }
    }
  } catch (e0) {
    failures.push({
      probe: 'Backend API Health (/api/health)',
      url: 'https://agents.shunyalabs.ai/api/health',
      status: 'CONNECTION_ERROR',
      error: e0.toString()
    });
  }

  // Probe 2: Backend State Integrity Endpoint (/api/health/state-integrity)
  try {
    var stateRes = UrlFetchApp.fetch('https://agents.shunyalabs.ai/api/health/state-integrity', {
      muteHttpExceptions: true
    });
    var stateCode = stateRes.getResponseCode();
    if (stateCode !== 200) {
      failures.push({
        probe: 'Backend State Integrity (/api/health/state-integrity)',
        url: 'https://agents.shunyalabs.ai/api/health/state-integrity',
        status: 'HTTP ' + stateCode,
        error: 'Expected HTTP 200, received ' + stateCode
      });
    } else {
      var stateJson = JSON.parse(stateRes.getContentText());
      if (stateJson.ok !== true || (stateJson.errors && stateJson.errors.length > 0)) {
        failures.push({
          probe: 'Backend State Integrity (/api/health/state-integrity)',
          url: 'https://agents.shunyalabs.ai/api/health/state-integrity',
          status: 'INTEGRITY_ANOMALY',
          error: 'State integrity check failed: ' + stateRes.getContentText()
        });
      }
    }
  } catch (e0b) {
    failures.push({
      probe: 'Backend State Integrity (/api/health/state-integrity)',
      url: 'https://agents.shunyalabs.ai/api/health/state-integrity',
      status: 'CONNECTION_ERROR',
      error: e0b.toString()
    });
  }

  // Evaluate Probe Results
  if (failures.length > 0) {
    Logger.log('🚨 Health check detected ' + failures.length + ' failure(s) at ' + timestamp);
    sendFailureEmailAlert(CONFIG.ALERT_EMAIL, timestamp, failures);
  } else {
    Logger.log('✅ [5-Min Health Check] All Backend API probes healthy at ' + timestamp);
  }
}

/**
 * Send Instant Email Alert to Recipient via Google MailApp
 */
function sendFailureEmailAlert(recipient, timestamp, failures) {
  var subject = '🚨 [CRITICAL ALERT] Meera VAP API Health Check FAILED (' + timestamp + ' IST)';

  var failureRowsHtml = failures.map(function(f, i) {
    return '<tr>' +
      '<td style="padding:10px;border:1px solid #cbd5e1;font-weight:bold;">' + (i + 1) + '. ' + f.probe + '</td>' +
      '<td style="padding:10px;border:1px solid #cbd5e1;color:#b91c1c;font-weight:bold;">' + f.status + '</td>' +
      '<td style="padding:10px;border:1px solid #cbd5e1;font-family:monospace;font-size:12px;">' + f.error + '</td>' +
      '</tr>';
  }).join('');

  var htmlBody = '<div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;color:#0f172a;line-height:1.6;">' +
    '<div style="background:#b91c1c;color:#ffffff;padding:18px 24px;border-radius:8px 8px 0 0;">' +
    '<h2 style="margin:0;font-size:18px;">🚨 Meera VAP — 5-Minute API Health Check Failure Alert</h2>' +
    '</div>' +
    '<div style="border:1px solid #cbd5e1;border-top:none;padding:24px;border-radius:0 0 8px 8px;background:#ffffff;">' +
    '<p><strong>Timestamp:</strong> ' + timestamp + ' IST</p>' +
    '<p><strong>Environment:</strong> <a href="https://agents.shunyalabs.ai/vap/">https://agents.shunyalabs.ai/vap/</a></p>' +
    '<p><strong>Failed Probes:</strong> <span style="color:#b91c1c;font-weight:bold;">' + failures.length + '</span></p>' +
    '<table style="width:100%;border-collapse:collapse;margin:16px 0;">' +
    '<thead><tr style="background:#f1f5f9;">' +
    '<th style="padding:8px 10px;border:1px solid #cbd5e1;text-align:left;">Probe</th>' +
    '<th style="padding:8px 10px;border:1px solid #cbd5e1;text-align:left;">Status</th>' +
    '<th style="padding:8px 10px;border:1px solid #cbd5e1;text-align:left;">Error Details</th>' +
    '</tr></thead>' +
    '<tbody>' + failureRowsHtml + '</tbody>' +
    '</table>' +
    '<p style="margin-top:20px;">' +
    '<a href="' + CONFIG.DASHBOARD_URL + '" style="background:#0f172a;color:#ffffff;padding:10px 18px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">Open QA Dashboard</a> ' +
    '<a href="https://docs.google.com/spreadsheets/d/' + CONFIG.SPREADSHEET_ID + '/edit" style="background:#15803d;color:#ffffff;padding:10px 18px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;margin-left:8px;">Open Google Sheet</a>' +
    '</p>' +
    '</div>' +
    '</div>';

  try {
    MailApp.sendEmail({
      to: recipient,
      subject: subject,
      htmlBody: htmlBody
    });
    Logger.log('📧 Successfully sent failure alert email to ' + recipient);
  } catch (err) {
    Logger.log('❌ Failed to send email via MailApp: ' + err.toString());
  }
}

/**
 * ============================================================================
 * 2. DAILY SCHEDULED SMOKE TEST SUITE (4:30 AM & 5:30 PM IST)
 * (Runs the 33-Test Automated Smoke Suite via GitHub Actions)
 * ============================================================================
 */

function setupDailyTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'executeScheduledRun') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  // 1. Morning Trigger: 4:30 AM IST
  ScriptApp.newTrigger('executeScheduledRun')
    .timeBased()
    .atHour(4)
    .nearMinute(30)
    .everyDays(1)
    .inTimezone(CONFIG.TIMEZONE)
    .create();

  // 2. Evening Trigger: 5:30 PM (17:30) IST
  ScriptApp.newTrigger('executeScheduledRun')
    .timeBased()
    .atHour(17)
    .nearMinute(30)
    .everyDays(1)
    .inTimezone(CONFIG.TIMEZONE)
    .create();

  Logger.log('✅ Daily Smoke Suite triggers configured: 4:30 AM and 5:30 PM (' + CONFIG.TIMEZONE + ')');
}

function executeScheduledRun() {
  var now = new Date();
  var timestampStr = Utilities.formatDate(now, CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
  var slot = (now.getHours() < 12) ? 'Morning Run (4:30 AM)' : 'Evening Run (5:30 PM)';

  Logger.log('🚀 Executing Scheduled Meera Smoke Suite Trigger for ' + slot + ' at ' + timestampStr);

  var triggered = triggerGitHubWorkflow(CONFIG.SMOKE_EVENT_TYPE, {
    trigger_slot: slot,
    triggered_at: timestampStr,
    environment: 'production',
    source: 'Google Apps Script Cloud Scheduler'
  });

  updateMasterDashboardStatus(timestampStr, slot, triggered ? 'TRIGGERED' : 'FAILED_TO_DISPATCH');
}

function triggerGitHubWorkflow(eventType, clientPayload) {
  var token = CONFIG.GITHUB_TOKEN;
  if (!token) {
    Logger.log('⚠️ GITHUB_PAT not configured in Script Properties. Skipping GitHub dispatch.');
    return false;
  }

  var url = 'https://api.github.com/repos/' + CONFIG.GITHUB_OWNER + '/' + CONFIG.GITHUB_REPO + '/dispatches';
  var payload = {
    event_type: eventType || CONFIG.SMOKE_EVENT_TYPE,
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

function updateMasterDashboardStatus(timestamp, slot, status, details) {
  var ss;
  try {
    ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  } catch (e) {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }
  if (!ss) return;

  var sheetName = 'Execution History';
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

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

  var statusCell = sheet.getRange(2, 4);
  if (status === 'TRIGGERED' || status === 'SUCCESS') {
    statusCell.setBackground('#dcfce7').setFontColor('#15803d').setFontWeight('bold');
  } else {
    statusCell.setBackground('#fee2e2').setFontColor('#b91c1c').setFontWeight('bold');
  }

  sheet.getRange(2, 1, 1, 8).setBorder(null, null, true, null, null, null, '#cbd5e1', SpreadsheetApp.BorderStyle.SOLID);
}

/**
 * ============================================================================
 * 3. WEBHOOK RECEIVER (Supports incoming alerts from CI / Playwright)
 * ============================================================================
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var now = new Date();
    var timestampStr = Utilities.formatDate(now, CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss');

    if (data.type === 'API_HEALTH_FAILED') {
      sendFailureEmailAlert(
        data.recipient || CONFIG.ALERT_EMAIL,
        data.timestamp || timestampStr,
        data.failures || []
      );
      return ContentService.createTextOutput(JSON.stringify({ status: 'ok', message: 'Failure alert email sent' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (data.type === 'TEST_COMPLETED') {
      var slot = (now.getHours() < 12) ? 'Morning Run (4:00 AM)' : 'Evening Run (5:00 PM)';
      updateMasterDashboardStatus(timestampStr, slot, data.status || 'COMPLETED', {
        passRate: data.passRate,
        passed: data.passed,
        total: data.total,
        notes: data.notes || 'Playwright run completed'
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
