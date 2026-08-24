#!/usr/bin/env bash
# Generate production env files with independent cryptographic secrets.
# Writes backend/.env.production and frontend/.env.production (gitignored).
# Does not print secret values. Does not overwrite unless --force.
#
# Usage:
#   ./scripts/init-prod-env.sh
#   SITE_URL=https://parvanerazaghiart.com CORS_ORIGIN=https://parvanerazaghiart.com ./scripts/init-prod-env.sh
#   ./scripts/init-prod-env.sh --force
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FORCE=0
for arg in "$@"; do
  case "${arg}" in
    --force) FORCE=1 ;;
    -h|--help)
      printf '%s\n' "Usage: $0 [--force]"
      exit 0
      ;;
    *)
      printf 'ERROR: unknown argument: %s\n' "${arg}" >&2
      exit 1
      ;;
  esac
done

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || { printf 'ERROR: missing %s\n' "$1" >&2; exit 1; }
}

need_cmd openssl

umask 077

BACKEND_ENV="${ROOT}/backend/.env.production"
FRONTEND_ENV="${ROOT}/frontend/.env.production"

if [[ -f "${BACKEND_ENV}" || -f "${FRONTEND_ENV}" ]]; then
  if [[ "${FORCE}" -ne 1 ]]; then
    printf 'ERROR: production env already exists. Re-run with --force to replace.\n' >&2
    printf '       Refusing to overwrite secrets.\n' >&2
    exit 1
  fi
fi

rand() { openssl rand -hex 64; }

JWT_SECRET="$(rand)"
JWT_REFRESH_SECRET="$(rand)"
MEDIA_SIGNING_SECRET="$(rand)"
INQUIRY_HASH_SECRET="$(rand)"

SITE_URL="${SITE_URL:-https://parvanerazaghiart.com}"
CORS_ORIGIN="${CORS_ORIGIN:-${SITE_URL}}"
# Next server talks to Nest on loopback. Browsers must not use this URL.
NEST_LOOPBACK_API="${NEST_LOOPBACK_API:-http://127.0.0.1:3001/api}"
DATABASE_URL="${DATABASE_URL:-postgresql://USER:PASSWORD@127.0.0.1:5432/parvanerazaghiart?schema=public}"
MEDIA_ROOT="${MEDIA_ROOT:-./storage/media}"

cat > "${BACKEND_ENV}" <<EOF
NODE_ENV=production
HOST=127.0.0.1
PORT=3001
DATABASE_URL=${DATABASE_URL}
JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
MEDIA_SIGNING_SECRET=${MEDIA_SIGNING_SECRET}
INQUIRY_HASH_SECRET=${INQUIRY_HASH_SECRET}
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=${CORS_ORIGIN}
MEDIA_ROOT=${MEDIA_ROOT}
EOF

cat > "${FRONTEND_ENV}" <<EOF
NODE_ENV=production
NEXT_PUBLIC_API_URL=${NEST_LOOPBACK_API}
NEXT_PUBLIC_SITE_URL=${SITE_URL}
EOF

unset JWT_SECRET JWT_REFRESH_SECRET MEDIA_SIGNING_SECRET INQUIRY_HASH_SECRET

printf 'Wrote %s (mode 600)\n' "${BACKEND_ENV}"
printf 'Wrote %s (mode 600)\n' "${FRONTEND_ENV}"
printf 'Replace DATABASE_URL USER/PASSWORD placeholders before deploy.\n'
printf 'Secrets were not printed. Keep these files off git and off backups that are world-readable.\n'
