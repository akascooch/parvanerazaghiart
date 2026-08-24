#!/usr/bin/env bash
# Production deploy for Parvane Razaghi Art (Linux / Ubuntu-Debian).
# Idempotent application rollout. Does not SSH, does not rewrite nginx TLS,
# and does not print secrets.
#
# Usage (from any cwd, on the server checkout):
#   ./scripts/deploy.sh
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

log() { printf '%s %s\n' "[$(date -u +%Y-%m-%dT%H:%M:%SZ)]" "$*"; }
die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "missing required command: $1"
}

need_file() {
  [[ -f "$1" ]] || die "missing required file: $1"
}

health_ok() {
  local url="$1"
  curl -fsS --max-time 5 "$url" >/dev/null 2>&1
}

log "deploy root: ${ROOT}"

need_cmd node
need_cmd pnpm
need_cmd pm2
need_cmd nginx
need_cmd psql
need_cmd curl

node_major="$(node -p "process.versions.node.split('.')[0]")"
if (( node_major < 20 )); then
  die "Node.js >= 20 required (found $(node -v))"
fi

need_file "${ROOT}/ecosystem.config.cjs"
need_file "${ROOT}/backend/pnpm-lock.yaml"
need_file "${ROOT}/frontend/pnpm-lock.yaml"
need_file "${ROOT}/backend/prisma/schema.prisma"

if [[ ! -f "${ROOT}/backend/.env.production" && ! -f "${ROOT}/backend/.env" ]]; then
  die "backend/.env.production (or backend/.env) is missing — run scripts/init-prod-env.sh first"
fi
if [[ ! -f "${ROOT}/frontend/.env.production" && ! -f "${ROOT}/frontend/.env.local" ]]; then
  die "frontend/.env.production is missing — run scripts/init-prod-env.sh first"
fi

mkdir -p "${ROOT}/logs" "${ROOT}/backend/storage/media"

log "installing backend dependencies (frozen lockfile)"
pnpm --dir backend install --frozen-lockfile

log "installing frontend dependencies (frozen lockfile)"
pnpm --dir frontend install --frozen-lockfile

if [[ "${INSTALL_SHARP:-0}" == "1" ]]; then
  log "INSTALL_SHARP=1 — adding sharp on this Linux host only"
  pnpm --dir backend add sharp
fi

log "prisma generate (native Linux engines)"
pnpm --dir backend exec prisma generate \
  || die "prisma generate failed — aborting"

log "pre-flight: prisma migrate deploy (will abort on failure)"
pnpm --dir backend exec prisma migrate deploy \
  || die "prisma migrate deploy failed — aborting before build/reload (database unchanged by generate/build)"

log "building backend"
pnpm --dir backend build || die "backend build failed — aborting before reload"

log "building frontend"
pnpm --dir frontend build || die "frontend build failed — aborting before reload"

log "PM2 startOrReload (production, loopback bind in ecosystem)"
pm2 startOrReload "${ROOT}/ecosystem.config.cjs" --env production --update-env \
  || die "pm2 startOrReload failed"

log "waiting for loopback health"
ok=0
for _ in $(seq 1 20); do
  if health_ok "http://127.0.0.1:3000/api/health" && health_ok "http://127.0.0.1:3001/api/health"; then
    ok=1
    break
  fi
  sleep 2
done
if [[ "${ok}" -ne 1 ]]; then
  die "health check failed: http://127.0.0.1:3000/api/health (and/or :3001/api/health)"
fi

curl -fsS "http://127.0.0.1:3000/api/health"
printf '\n'

if [[ -f /etc/nginx/sites-enabled/parvanerazaghiart.conf || -f /etc/nginx/conf.d/parvanerazaghiart.conf ]]; then
  log "nginx site present — syntax-check only (no reload)"
  nginx -t || die "nginx -t failed"
fi

pm2 save || log "warning: pm2 save failed (process dump not updated)"

log "deploy succeeded"
