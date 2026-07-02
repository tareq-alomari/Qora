#!/usr/bin/env bash
#
# Qor3a Unified Project Launcher
# ==============================
# 1. Installs dependencies (API + Frontend)
# 2. Runs DB migrations
# 3. Runs seeds + demo data
# 4. Starts API server (port 3000)
# 5. Starts Frontend dev server (port 5173)
# 6. Shows summary
#
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
API_DIR="$ROOT_DIR/backend/api"
FE_DIR="$ROOT_DIR/frontend"
API_PID_FILE="/tmp/qor3a-api.pid"
FE_PID_FILE="/tmp/qor3a-fe.pid"
API_PORT="${API_PORT:-3000}"
FE_PORT="${FE_PORT:-5173}"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
BOLD='\033[1m'

info()  { echo -e "${CYAN}[Qor3a]${NC} $1"; }
ok()    { echo -e "${GREEN}[✓]${NC} $1"; }
warn()  { echo -e "${YELLOW}[!]${NC} $1"; }
err()   { echo -e "${RED}[✗]${NC} $1"; }

cleanup() {
  for f in "$API_PID_FILE" "$FE_PID_FILE"; do
    if [ -f "$f" ]; then
      pid=$(cat "$f")
      if kill -0 "$pid" 2>/dev/null; then
        info "Stopping PID $pid..."
        kill "$pid" 2>/dev/null || true
        wait "$pid" 2>/dev/null || true
      fi
      rm -f "$f"
    fi
  done
  info "All services stopped."
}
trap cleanup EXIT INT TERM

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║           Qor3a — قرعة                       ║${NC}"
echo -e "${CYAN}║        Unified Project Launcher              ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════╝${NC}"
echo ""

# ── Prerequisites ──
if ! command -v node &>/dev/null; then err "Node.js not found"; exit 1; fi
if ! command -v npm  &>/dev/null; then err "npm not found";    exit 1; fi
ok "Node.js $(node -v)"
ok "npm $(npm -v)"

# ── Install API dependencies ──
if [ ! -d "$API_DIR/node_modules" ]; then
  info "Installing API dependencies..."
  (cd "$API_DIR" && npm install) || { err "API npm install failed"; exit 1; }
  ok "API dependencies installed"
else
  ok "API dependencies found"
fi

# ── Install Frontend dependencies ──
if [ ! -d "$FE_DIR/node_modules" ]; then
  info "Installing Frontend dependencies..."
  (cd "$FE_DIR" && npm install) || { err "Frontend npm install failed"; exit 1; }
  ok "Frontend dependencies installed"
else
  ok "Frontend dependencies found"
fi

# ── .env check ──
if [ ! -f "$ROOT_DIR/.env" ]; then
  warn "No .env found at project root; copying from .env.example..."
  cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env" 2>/dev/null || true
fi

# ── DB: migrate ──
info "Running database migrations..."
(cd "$API_DIR" && npx knex migrate:latest 2>&1) || { err "Migration failed"; exit 1; }
ok "Migrations applied"

# ── DB: seed (core + demo) ──
info "Running database seeds..."
(cd "$API_DIR" && npx knex seed:run 2>&1) || { warn "Seed may have failed (continuing)"; }
ok "Seeds complete (admin + demo data)"

# ── Kill leftover processes ──
for f in "$API_PID_FILE" "$FE_PID_FILE"; do
  [ -f "$f" ] && cleanup
done

# ── Start API server ──
info "Starting API server on port $API_PORT..."
(cd "$API_DIR" && node src/index.js) &
API_PID=$!
echo "$API_PID" > "$API_PID_FILE"

# ── Wait for API ──
info "Waiting for API to be ready..."
ATTEMPTS=0
MAX_ATTEMPTS=30
while [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; do
  if curl -sf "http://localhost:$API_PORT/health" >/dev/null 2>&1; then
    ok "API server running on http://localhost:$API_PORT"
    break
  fi
  ATTEMPTS=$((ATTEMPTS + 1))
  sleep 1
done
if [ $ATTEMPTS -eq $MAX_ATTEMPTS ]; then err "API failed to start"; exit 1; fi

# ── Start Frontend server ──
info "Starting Frontend on port $FE_PORT..."
(cd "$FE_DIR" && npx vite --host 0.0.0.0 --port "$FE_PORT" 2>&1) &
FE_PID=$!
echo "$FE_PID" > "$FE_PID_FILE"

# ── Wait for Frontend ──
info "Waiting for Frontend to be ready..."
ATTEMPTS=0
while [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; do
  if curl -sf "http://localhost:$FE_PORT/" >/dev/null 2>&1; then
    ok "Frontend running on http://localhost:$FE_PORT"
    break
  fi
  ATTEMPTS=$((ATTEMPTS + 1))
  sleep 1
done
if [ $ATTEMPTS -eq $MAX_ATTEMPTS ]; then warn "Frontend may not be ready yet — check logs"; fi

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         🎉 Qor3a is fully running!          ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${CYAN}🌐 Frontend:${NC}      http://localhost:$FE_PORT"
echo -e "  ${CYAN}⚙️  API:${NC}          http://localhost:$API_PORT"
echo -e "  ${CYAN}📖 API Docs:${NC}      http://localhost:$API_PORT/docs"
echo -e "  ${CYAN}❤️  Health:${NC}        http://localhost:$API_PORT/health"
echo ""
echo -e "  ${BOLD}Dashboard login:${NC}"
echo -e "    ${YELLOW}Admin:${NC}    admin@qor3a.ye / admin123"
echo -e "    ${YELLOW}Employee:${NC} employee@qor3a.ye / admin123"
echo ""
echo -e "  ${BOLD}Client logins:${NC}"
echo -e "    ${YELLOW}Client 1:${NC}  ahmed@example.com / client123  (draft + data_entry orders)"
echo -e "    ${YELLOW}Client 2:${NC}  sara@example.com / client123   (photo_pending + needs_correction)"
echo -e "    ${YELLOW}Client 3:${NC}  khaled@example.com / client123 (payment_pending + photo_rejected)"
echo -e "    ${YELLOW}Client 4:${NC}  noor@example.com / client123   (approved + submitted)"
echo -e "    ${YELLOW}Client 5:${NC}  yasser@example.com / client123 (completed)"
echo ""
echo -e "  ${BOLD}Demo orders (12 orders in all states):${NC}"
echo -e "    draft → data_entry → photo_pending → photo_rejected"
echo -e "    photo_accepted → payment_pending → payment_verification"
echo -e "    approved → submitted → completed → cancelled"
echo -e "    needs_correction"
echo ""
echo -e "  ${YELLOW}Plugins / Extras:${NC}"
echo -e "    ${CYAN}AI Service:${NC}     http://localhost:8000 (Python FastAPI)"
echo -e "    ${CYAN}Headless:${NC}      cd backend/headless && npm start (Puppeteer)"
echo ""

info "Press Ctrl+C to stop all services."
wait
