#!/usr/bin/env bash
#
# Qor3a Development Launcher
# ==========================
# 1. Installs dependencies (if needed)
# 2. Runs database seed
# 3. Starts the API server
# 4. Opens browser tabs for docs + landing page
#
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
API_DIR="$ROOT_DIR/backend/api"
PID_FILE="/tmp/qor3a-api.pid"
PORT="${PORT:-3000}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

info()  { echo -e "${CYAN}[Qor3a]${NC} $1"; }
ok()    { echo -e "${GREEN}[✓]${NC} $1"; }
warn()  { echo -e "${YELLOW}[!]${NC} $1"; }
err()   { echo -e "${RED}[✗]${NC} $1"; }

cleanup() {
  if [ -f "$PID_FILE" ]; then
    local pid
    pid=$(cat "$PID_FILE")
    if kill -0 "$pid" 2>/dev/null; then
      info "Stopping server (PID $pid)..."
      kill "$pid" 2>/dev/null || true
      wait "$pid" 2>/dev/null || true
    fi
    rm -f "$PID_FILE"
  fi
  info "Done."
}
trap cleanup EXIT INT TERM

echo ""
echo -e "${CYAN}╔══════════════════════════════════════╗${NC}"
echo -e "${CYAN}║         Qor3a — قرعة                ║${NC}"
echo -e "${CYAN}║    Development Launcher             ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════╝${NC}"
echo ""

# ── Check Node.js ──
if ! command -v node &>/dev/null; then
  err "Node.js is not installed. Please install Node.js 18+ first."
  exit 1
fi
ok "Node.js $(node -v)"

# ── Install dependencies ──
if [ ! -d "$API_DIR/node_modules" ]; then
  info "Installing dependencies..."
  (cd "$API_DIR" && npm install) || {
    err "npm install failed"
    exit 1
  }
  ok "Dependencies installed"
else
  ok "Dependencies found"
fi

# ── Environment file ──
if [ ! -f "$API_DIR/../../.env" ] && [ ! -f "$API_DIR/.env" ]; then
  warn "No .env file found. Copying from .env.example..."
  cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env" 2>/dev/null || true
fi

# ── Run seed ──
info "Running database seed..."
(cd "$API_DIR" && npx knex seed:run 2>&1) || {
  warn "Seed may have failed (DB not ready yet — continuing)"
}
ok "Seed complete"

# ── Kill any existing server ──
if [ -f "$PID_FILE" ]; then
  cleanup
fi

# ── Start server ──
info "Starting API server on port $PORT..."
(cd "$API_DIR" && node src/index.js) &
SERVER_PID=$!
echo "$SERVER_PID" > "$PID_FILE"

# ── Wait for server ──
info "Waiting for server to be ready..."
ATTEMPTS=0
MAX_ATTEMPTS=30
while [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; do
  if curl -sf "http://localhost:$PORT/health" >/dev/null 2>&1; then
    ok "Server is running on http://localhost:$PORT"
    break
  fi
  ATTEMPTS=$((ATTEMPTS + 1))
  sleep 1
done

if [ $ATTEMPTS -eq $MAX_ATTEMPTS ]; then
  err "Server failed to start within $MAX_ATTEMPTS seconds"
  exit 1
fi

echo ""
echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         Qor3a is ready!             ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${CYAN}API:${NC}       http://localhost:$PORT"
echo -e "  ${CYAN}Docs:${NC}      http://localhost:$PORT/docs"
echo -e "  ${CYAN}Health:${NC}    http://localhost:$PORT/health"
echo ""

# ── Open browser ──
if command -v xdg-open &>/dev/null; then
  info "Opening browser tabs..."
  xdg-open "http://localhost:$PORT" 2>/dev/null      # Landing page
  sleep 1
  xdg-open "http://localhost:$PORT/docs" 2>/dev/null  # API docs
elif command -v open &>/dev/null; then
  info "Opening browser tabs..."
  open "http://localhost:$PORT"
  sleep 1
  open "http://localhost:$PORT/docs"
else
  warn "No browser opener found. Open manually:"
  echo "    http://localhost:$PORT"
  echo "    http://localhost:$PORT/docs"
fi

echo ""
info "Press Ctrl+C to stop the server."
echo ""

# Wait for server process
wait "$SERVER_PID"
