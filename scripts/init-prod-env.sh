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

die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

need_cmd mv
need_cmd chmod
need_cmd cat
if [[ ! -r /dev/urandom ]] && ! command -v node >/dev/null 2>&1 && ! command -v openssl >/dev/null 2>&1; then
  die "need /dev/urandom, node, or openssl before writing env files"
fi

rand() {
  local out=""
  set +o pipefail
  if [[ -r /dev/urandom ]] && command -v od >/dev/null 2>&1; then
    out="$(od -An -N64 -tx1 /dev/urandom | tr -d ' \n\r')"
  fi
  if [[ "${#out}" -lt 64 ]] && command -v node >/dev/null 2>&1; then
    out="$(node -e "process.stdout.write(require('crypto').randomBytes(64).toString('hex'))")"
  fi
  if [[ "${#out}" -lt 64 ]] && command -v openssl >/dev/null 2>&1; then
    out="$(openssl rand -hex 64 | tr -d ' \n\r')"
  fi
  set -o pipefail
  if [[ "${#out}" -lt 64 ]]; then
    die "need /dev/urandom, node, or openssl to generate secrets"
  fi
  printf '%s' "${out}"
}

require_prod_site_url() {
  local url="${1%$'\r'}"
  [[ "${url}" =~ ^https://[A-Za-z0-9._-]+ ]] || die "SITE_URL must be a public https:// origin"
  case "${url}" in
    *localhost*|*127.0.0.1*|*0.0.0.0*)
      die "SITE_URL must not be localhost/loopback for production"
      ;;
  esac
  if [[ "${url}" == *::1* ]]; then
    die "SITE_URL must not be localhost/loopback for production"
  fi
  return 0
}

umask 077

BACKEND_DIR="${ROOT}/backend"
FRONTEND_DIR="${ROOT}/frontend"
BACKEND_ENV="${BACKEND_DIR}/.env.production"
FRONTEND_ENV="${FRONTEND_DIR}/.env.production"

mkdir -p "${BACKEND_DIR}" "${FRONTEND_DIR}"

if [[ -f "${BACKEND_ENV}" || -f "${FRONTEND_ENV}" ]]; then
  if [[ "${FORCE}" -ne 1 ]]; then
    printf 'ERROR: production env already exists. Re-run with --force to replace.\n' >&2
    printf '       Refusing to overwrite secrets.\n' >&2
    exit 1
  fi
fi

SITE_URL="${SITE_URL:-https://parvanerazaghiart.com}"
CORS_ORIGIN="${CORS_ORIGIN:-${SITE_URL}}"
NEST_LOOPBACK_API="${NEST_LOOPBACK_API:-http://127.0.0.1:3001/api}"
DATABASE_URL="${DATABASE_URL:-postgresql://USER:PASSWORD@127.0.0.1:5432/parvanerazaghiart?schema=public}"
MEDIA_ROOT="${MEDIA_ROOT:-./storage/media}"

require_prod_site_url "${SITE_URL}"
[[ "${NEST_LOOPBACK_API}" == "http://127.0.0.1:3001/api" ]] \
  || die "NEST_LOOPBACK_API must remain http://127.0.0.1:3001/api"

JWT_SECRET="$(rand)"
JWT_REFRESH_SECRET="$(rand)"
MEDIA_SIGNING_SECRET="$(rand)"
INQUIRY_HASH_SECRET="$(rand)"

if [[ "${#JWT_SECRET}" -lt 64 || "${#JWT_REFRESH_SECRET}" -lt 64 \
  || "${#MEDIA_SIGNING_SECRET}" -lt 64 || "${#INQUIRY_HASH_SECRET}" -lt 64 ]]; then
  die "generated secret was shorter than expected"
fi
if [[ "${JWT_SECRET}" == "${JWT_REFRESH_SECRET}" || "${JWT_SECRET}" == "${MEDIA_SIGNING_SECRET}" \
  || "${JWT_SECRET}" == "${INQUIRY_HASH_SECRET}" || "${JWT_REFRESH_SECRET}" == "${MEDIA_SIGNING_SECRET}" \
  || "${JWT_REFRESH_SECRET}" == "${INQUIRY_HASH_SECRET}" || "${MEDIA_SIGNING_SECRET}" == "${INQUIRY_HASH_SECRET}" ]]; then
  die "generated secrets were not independent"
fi

backend_tmp="${BACKEND_ENV}.tmp.$$"
frontend_tmp="${FRONTEND_ENV}.tmp.$$"
cleanup() {
  rm -f "${backend_tmp:-}" "${frontend_tmp:-}"
}
trap cleanup EXIT

cat > "${backend_tmp}" <<EOF
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

cat > "${frontend_tmp}" <<EOF
NODE_ENV=production
NEXT_PUBLIC_API_URL=${NEST_LOOPBACK_API}
NEXT_PUBLIC_SITE_URL=${SITE_URL}
EOF

chmod 600 "${backend_tmp}" "${frontend_tmp}"
mv -f "${backend_tmp}" "${BACKEND_ENV}"
mv -f "${frontend_tmp}" "${FRONTEND_ENV}"
chmod 600 "${BACKEND_ENV}" "${FRONTEND_ENV}"
backend_tmp=""
frontend_tmp=""

unset JWT_SECRET JWT_REFRESH_SECRET MEDIA_SIGNING_SECRET INQUIRY_HASH_SECRET DATABASE_URL

printf 'Wrote %s (mode 600)\n' "${BACKEND_ENV}"
printf 'Wrote %s (mode 600)\n' "${FRONTEND_ENV}"
printf 'Replace DATABASE_URL placeholders before deploy if still USER:PASSWORD.\n'
printf 'Secrets were not printed. Keep these files off git and off world-readable backups.\n'
printf 'SMTP is not used; enquiry persistence is Postgres-only.\n'
