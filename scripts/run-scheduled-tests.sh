#!/usr/bin/env bash
# ==============================================================================
# Meera Voice Agent Platform - Twice-Daily Scheduled QA Runner
# Runs automatically at 4:00 AM & 5:00 PM IST via macOS LaunchAgent
# ==============================================================================
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

LOG_DIR="$PROJECT_DIR/logs"
mkdir -p "$LOG_DIR"

TIMESTAMP="$(date '+%Y-%m-%d_%H-%M-%S')"
LOG_FILE="$LOG_DIR/scheduled_run_${TIMESTAMP}.log"
LATEST_LOG="$LOG_DIR/latest.log"

exec > >(tee -a "$LOG_FILE" > "$LATEST_LOG") 2>&1

echo "========================================================"
echo "  Meera Scheduled QA Test Run — $(date '+%Y-%m-%d %H:%M:%S')"
echo "  Project: $PROJECT_DIR"
echo "========================================================"

# Environment & PATH Setup
export PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node 2>/dev/null | tail -n 1)/bin:$PATH"
export HOME="/Users/unitedwecare"
export CI=true

if [ -f "$HOME/.nvm/nvm.sh" ]; then
  export NVM_DIR="$HOME/.nvm"
  # shellcheck disable=SC1090
  source "$NVM_DIR/nvm.sh"
  nvm use default 2>/dev/null || true
fi

# Hard deadline watchdog (90 mins = 5400s)
RUN_DEADLINE_SECS=5400
PARENT_PID=$$
(
  sleep "$RUN_DEADLINE_SECS"
  echo "[watchdog] Timeout ($RUN_DEADLINE_SECS s) exceeded. Terminating test run." >&2
  pkill -KILL -P "$PARENT_PID" 2>/dev/null || true
  kill -KILL "$PARENT_PID" 2>/dev/null || true
) &
WATCHDOG_PID=$!

cleanup() {
  kill "$WATCHDOG_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# 0. Pre-flight Mutual Exclusion & Deduplication Check
# If Google Apps Script or GitHub Actions already triggered or completed this slot, skip local run.
echo "[step 0/4] Checking scheduler slot deduplication status..."
if node e2e/scripts/check-scheduled-dedup.mjs; then
  echo "[step 0/4] Dedup check passed. Proceeding with local scheduled run."
else
  DEDUP_STATUS=$?
  if [ "$DEDUP_STATUS" -eq 2 ]; then
    echo "[step 0/4] Cloud/Apps Script run already triggered for this slot. Skipping local run to avoid duplicate output."
    exit 0
  else
    echo "[step 0/4] Warning: Dedup check exited with code $DEDUP_STATUS. Proceeding as fallback."
  fi
fi

# 1. Scan catalog and prepare initial dashboard
echo "[step 1/4] Scanning test catalog..."
node e2e/scripts/scan-test-catalog.mjs || true

# 2. Run Playwright Smoke Automated Tests across all functionalities
echo "[step 2/4] Executing Playwright Smoke Test Suite (@smoke)..."
npx playwright test --grep "${E2E_GREP:-@smoke}" || true

# 3. Export sheet results, build dashboard & publish
echo "[step 3/4] Updating sheets & dashboard..."
npm run sheet:update || {
  echo "[step 3/4] Running fallback dashboard build..."
  node e2e/scripts/scan-test-catalog.mjs || true
  node e2e/scripts/build-dashboard.mjs || true
}

echo "========================================================"
echo "  Meera Scheduled QA Run Finished — $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================================"
