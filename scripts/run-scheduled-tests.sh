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

# 1. Scan catalog and prepare initial dashboard
echo "[step 1/4] Scanning test catalog..."
node e2e/scripts/scan-test-catalog.mjs || true

# 2. Run Playwright Automated Tests
echo "[step 2/4] Executing Playwright E2E suite..."
npx playwright test || true

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
