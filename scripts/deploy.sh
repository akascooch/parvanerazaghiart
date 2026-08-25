#!/usr/bin/env bash
# Production deploy for Parvane Razaghi Art (Linux / Ubuntu-Debian).
# Does not SSH, does not rewrite nginx TLS, and does not print secrets.
#
# Usage:
#   ./scripts/deploy.sh           # full rollout
#   ./scripts/deploy.sh --check   # validate only (no install/migrate/build/pm2)
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

CHECK_ONLY=0
for arg in "$@"; do
  case "${arg}" in
    --check) CHECK_ONLY=1 ;;
    -h|--help)
      printf '%s\n' "Usage: $0 [--check]"
      exit 0
      ;;
    *)
      printf 'ERROR: unknown argument: %s\n' "${arg}" >&2
      exit 1
      ;;
  esac
done

log() { printf '%s %s\n' "[$(date -u +%Y-%m-%dT%H:%M:%SZ)]" "$*"; }
die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

trap 'rc=$?; if [[ $rc -ne 0 ]]; then printf "ERROR: deploy aborted (line %s, exit %s)\n" "${LINENO}" "${rc}" >&2; fi' ERR

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "missing required command: $1"
}

need_file() {
  [[ -f "$1" ]] || die "missing required file: $1"
}

env_get() {
  local file="$1" key="$2" line="" val=""
  line="$(grep -E "^${key}=" "$file" | tail -n 1 || true)"
  val="${line#${key}=}"
  val="${val%$'\r'}"
  printf '%s' "${val}"
}

env_nonempty() {
  local val
  val="$(env_get "$1" "$2")"
  [[ -n "${val}" ]]
}

is_placeholder() {
  local val="$1"
  [[ -z "${val}" ]] && return 0
  case "${val}" in
    YOUR_PASSWORD*|change-me*|generate-with-openssl*|*USER:PASSWORD*) return 0 ;;
  esac
  return 1
}

require_prod_site_url() {
  local url="${1%$'\r'}"
  [[ "${url}" =~ ^https://[A-Za-z0-9._-]+ ]] || die "NEXT_PUBLIC_SITE_URL must be a public https:// origin"
  case "${url}" in
    *localhost*|*127.0.0.1*|*0.0.0.0*)
      die "NEXT_PUBLIC_SITE_URL must not be localhost/loopback for production"
      ;;
  esac
  if [[ "${url}" == *::1* ]]; then
    die "NEXT_PUBLIC_SITE_URL must not be localhost/loopback for production"
  fi
  return 0
}

health_web_ok() {
  local body
  body="$(curl -fsS --max-time 5 "http://127.0.0.1:3000/api/health")" || return 1
  [[ "${body}" == *'"web":"ok"'* || "${body}" == *'"web": "ok"'* ]] || return 1
  [[ "${body}" == *'"status":"ok"'* || "${body}" == *'"status": "ok"'* ]] || return 1
  return 0
}

health_api_ok() {
  local body
  body="$(curl -fsS --max-time 5 "http://127.0.0.1:3001/api/health")" || return 1
  [[ "${body}" == *'"status":"ok"'* || "${body}" == *'"status": "ok"'* ]] || return 1
  return 0
}

# Immutable releases live under /var/www/parvanerazaghiart/releases/<sha>.
# Shared media survives those trees. Override with PRA_APP_ROOT if needed.
APP_ROOT="${PRA_APP_ROOT:-}"
if [[ -z "${APP_ROOT}" ]]; then
  case "${ROOT}" in
    /var/www/parvanerazaghiart/releases/*)
      APP_ROOT="/var/www/parvanerazaghiart"
      ;;
  esac
fi
SHARED_MEDIA="${APP_ROOT:+${APP_ROOT}/shared/storage/media}"

ensure_persistent_media() {
  mkdir -p "${ROOT}/logs" "${ROOT}/backend/storage"

  if [[ -z "${APP_ROOT}" ]]; then
    mkdir -p "${ROOT}/backend/storage/media"
    log "media: local directory (not a /releases tree)"
    return 0
  fi

  mkdir -p "${APP_ROOT}/shared/storage/media"
  chmod 755 "${APP_ROOT}/shared" "${APP_ROOT}/shared/storage" "${SHARED_MEDIA}" || true

  local release_media="${ROOT}/backend/storage/media"
  if [[ -L "${release_media}" ]]; then
    local target shared
    target="$(readlink -f "${release_media}" || true)"
    shared="$(readlink -f "${SHARED_MEDIA}")"
    if [[ "${target}" != "${shared}" ]]; then
      rm -f "${release_media}"
      ln -s "${SHARED_MEDIA}" "${release_media}"
      log "media: retargeted symlink -> shared/storage/media"
    else
      log "media: already linked to shared/storage/media"
    fi
    return 0
  fi

  if [[ -d "${release_media}" ]]; then
    log "media: migrating release directory into shared/storage/media"
    cp -a "${release_media}/." "${SHARED_MEDIA}/"
    rm -rf "${release_media}"
  elif [[ -e "${release_media}" ]]; then
    die "backend/storage/media exists and is not a directory or symlink"
  fi

  ln -s "${SHARED_MEDIA}" "${release_media}"
  log "media: linked backend/storage/media -> shared/storage/media"
}

point_current_symlink() {
  if [[ -z "${APP_ROOT}" ]]; then
    return 0
  fi
  ln -sfn "${ROOT}" "${APP_ROOT}/current"
  log "current -> ${ROOT}"
}

pm2_api_cwd() {
  pm2 jlist 2>/dev/null | node -e '
    let raw = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => { raw += chunk; });
    process.stdin.on("end", () => {
      try {
        const list = JSON.parse(raw);
        const app = Array.isArray(list)
          ? list.find((item) => item && item.name === "parvanerazaghiart-api")
          : null;
        process.stdout.write((app && app.pm2_env && app.pm2_env.pm_cwd) || "");
      } catch {
        process.stdout.write("");
      }
    });
  ' || true
}

reload_pm2_from_this_release() {
  local expected="${ROOT}/backend"
  local running
  running="$(pm2_api_cwd)"
  if [[ -n "${running}" && "${running}" == "${expected}" ]]; then
    log "PM2 cwd already this release — startOrReload"
    pm2 startOrReload "${ROOT}/ecosystem.config.cjs" --env production --update-env \
      || die "pm2 startOrReload failed"
    return 0
  fi
  log "PM2 cwd switch to this release (delete + start)"
  pm2 delete parvanerazaghiart-api parvanerazaghiart-web >/dev/null 2>&1 || true
  pm2 start "${ROOT}/ecosystem.config.cjs" --env production \
    || die "pm2 start failed"
}

log "deploy root: ${ROOT}"

need_cmd node
need_cmd pnpm
need_cmd pm2
need_cmd curl
if command -v nginx >/dev/null 2>&1; then
  :
else
  log "warning: nginx not on PATH (app deploy can proceed; TLS proxy is a separate step)"
fi
if command -v psql >/dev/null 2>&1; then
  :
else
  log "warning: psql not on PATH (Prisma migrate deploy is the database gate)"
fi
if command -v openssl >/dev/null 2>&1; then
  :
else
  log "warning: openssl not on PATH (needed only by init-prod-env.sh, not by deploy)"
fi

node_major="$(node -p "process.versions.node.split('.')[0]")"
if (( node_major < 20 )); then
  die "Node.js >= 20 required (found $(node -v))"
fi
pnpm_major="$(pnpm -v | cut -d. -f1)"
if (( pnpm_major < 9 )); then
  die "pnpm >= 9 required"
fi

need_file "${ROOT}/ecosystem.config.cjs"
need_file "${ROOT}/backend/pnpm-lock.yaml"
need_file "${ROOT}/frontend/pnpm-lock.yaml"
need_file "${ROOT}/backend/prisma/schema.prisma"

BACKEND_ENV="${ROOT}/backend/.env.production"
FRONTEND_ENV="${ROOT}/frontend/.env.production"
need_file "${BACKEND_ENV}"
need_file "${FRONTEND_ENV}"

for key in NODE_ENV HOST PORT DATABASE_URL JWT_SECRET JWT_REFRESH_SECRET \
  MEDIA_SIGNING_SECRET INQUIRY_HASH_SECRET CORS_ORIGIN MEDIA_ROOT; do
  env_nonempty "${BACKEND_ENV}" "${key}" || die "backend .env.production missing ${key}"
done
for key in NODE_ENV NEXT_PUBLIC_API_URL NEXT_PUBLIC_SITE_URL; do
  env_nonempty "${FRONTEND_ENV}" "${key}" || die "frontend .env.production missing ${key}"
done

backend_node_env="$(env_get "${BACKEND_ENV}" NODE_ENV)"
frontend_node_env="$(env_get "${FRONTEND_ENV}" NODE_ENV)"
[[ "${backend_node_env}" == "production" ]] || die "backend NODE_ENV must be production"
[[ "${frontend_node_env}" == "production" ]] || die "frontend NODE_ENV must be production"

host="$(env_get "${BACKEND_ENV}" HOST)"
[[ "${host}" == "127.0.0.1" ]] || die "backend HOST must be 127.0.0.1"

db_url="$(env_get "${BACKEND_ENV}" DATABASE_URL)"
if is_placeholder "${db_url}"; then
  die "DATABASE_URL still looks like a placeholder"
fi
unset db_url

jwt="$(env_get "${BACKEND_ENV}" JWT_SECRET)"
jwt_r="$(env_get "${BACKEND_ENV}" JWT_REFRESH_SECRET)"
media_s="$(env_get "${BACKEND_ENV}" MEDIA_SIGNING_SECRET)"
inq_s="$(env_get "${BACKEND_ENV}" INQUIRY_HASH_SECRET)"
if is_placeholder "${jwt}" || is_placeholder "${jwt_r}" || is_placeholder "${media_s}" || is_placeholder "${inq_s}"; then
  unset jwt jwt_r media_s inq_s
  die "one or more production secrets are placeholders — run init-prod-env.sh"
fi
if [[ "${jwt}" == "${jwt_r}" || "${jwt}" == "${media_s}" || "${jwt}" == "${inq_s}" \
  || "${jwt_r}" == "${media_s}" || "${jwt_r}" == "${inq_s}" || "${media_s}" == "${inq_s}" ]]; then
  unset jwt jwt_r media_s inq_s
  die "production secrets must be independent (no shared fallback)"
fi
unset jwt jwt_r media_s inq_s

if grep -E '^(JWT_SECRET|JWT_REFRESH_SECRET|MEDIA_SIGNING_SECRET|INQUIRY_HASH_SECRET|DATABASE_URL)=' \
  "${FRONTEND_ENV}" >/dev/null 2>&1; then
  die "frontend .env.production must not contain backend secrets"
fi

site_url="$(env_get "${FRONTEND_ENV}" NEXT_PUBLIC_SITE_URL)"
require_prod_site_url "${site_url}"
api_url="$(env_get "${FRONTEND_ENV}" NEXT_PUBLIC_API_URL)"
[[ "${api_url}" == "http://127.0.0.1:3001/api" ]] || die "NEXT_PUBLIC_API_URL must be the Nest loopback http://127.0.0.1:3001/api"
unset site_url api_url backend_node_env frontend_node_env host

if [[ "${CHECK_ONLY}" -eq 1 ]]; then
  log "check-only: environment and paths are valid; skipping install/migrate/build/pm2"
  exit 0
fi

# Prisma CLI reads backend/.env. Production secrets are in .env.production.
# Copy without printing values so migrate/generate can run on Linux hosts.
install -m 600 "${BACKEND_ENV}" "${ROOT}/backend/.env"

ensure_persistent_media

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

log "prisma migrate deploy (idempotent; abort on failure before build/reload)"
pnpm --dir backend exec prisma migrate deploy \
  || die "prisma migrate deploy failed — aborting before build/reload"

log "building backend"
pnpm --dir backend build || die "backend build failed — aborting before reload"

log "building frontend"
pnpm --dir frontend build || die "frontend build failed — aborting before reload"

log "PM2 named apps only (parvanerazaghiart-api / parvanerazaghiart-web)"
reload_pm2_from_this_release

log "waiting for loopback health"
ok=0
attempts="${DEPLOY_HEALTH_ATTEMPTS:-20}"
delay="${DEPLOY_HEALTH_SLEEP:-2}"
for _ in $(seq 1 "${attempts}"); do
  if health_web_ok && health_api_ok; then
    ok=1
    break
  fi
  sleep "${delay}"
done
if [[ "${ok}" -ne 1 ]]; then
  die "health check failed on loopback :3000/api/health and/or :3001/api/health — PM2 was already reloaded; restore previous release manually"
fi

log "health payload accepted"

if [[ -f /etc/nginx/sites-enabled/parvanerazaghiart.conf || -f /etc/nginx/conf.d/parvanerazaghiart.conf ]]; then
  log "nginx site present — syntax-check only (no reload)"
  nginx -t || die "nginx -t failed"
fi

pm2 save || log "warning: pm2 save failed (process dump not updated)"

point_current_symlink

log "deploy succeeded"
