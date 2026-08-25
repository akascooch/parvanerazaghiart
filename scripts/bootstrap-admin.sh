#!/usr/bin/env bash
# Create the first ADMIN user from environment variables.
# Never prints password/token. Refuses if an admin already exists.
#
# Required env (exported by the operator, not stored in git):
#   ADMIN_EMAIL
#   ADMIN_PASSWORD   (min 8 chars)
# Optional:
#   ADMIN_PHONE
#   ADMIN_NAME
#
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}/backend"

if [[ -z "${ADMIN_EMAIL:-}" || -z "${ADMIN_PASSWORD:-}" ]]; then
  printf 'ERROR: ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment.\n' >&2
  exit 1
fi
if [[ "${#ADMIN_PASSWORD}" -lt 8 ]]; then
  printf 'ERROR: ADMIN_PASSWORD must be at least 8 characters.\n' >&2
  exit 1
fi

export SEED_ADMIN_ONLY=1
pnpm exec prisma db seed
unset ADMIN_PASSWORD
printf 'bootstrap-admin: finished without printing credentials.\n'
