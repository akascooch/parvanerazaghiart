# Deployment readiness (Phase 8)

Local-safe checklist only. Do not SSH, migrate production, restart remote
services, or mix `next dev` with `next start` on the same port.

## Local vs production

| Concern | Local | Production notes |
| --- | --- | --- |
| Frontend | `http://localhost:3000` | Must equal `NEXT_PUBLIC_SITE_URL` |
| Backend | `http://localhost:3001` with prefix `/api` | Keep Nest internal; browsers use Next `/api/*` |
| Database | PostgreSQL 17 at `localhost:5432` | Separate production DSN |
| Media | `MEDIA_ROOT` outside the web root | Same rule on the server |
| SSH | n/a | The SSH port in Server Info is **not** an app port |

## Required environment variables

Backend (`backend/.env`), aligned with `backend/.env.example`:

- `NODE_ENV`
- `PORT` (local `3001`)
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `CORS_ORIGIN` (local `http://localhost:3000`)
- `MEDIA_ROOT`
- `ADMIN_EMAIL`, `ADMIN_PHONE`, `ADMIN_PASSWORD`, `ADMIN_NAME` (seed only)

Optional backend (local-dev fallback only — production must set dedicated values):

- `MEDIA_SIGNING_SECRET` — required in production; local fallback to `JWT_SECRET` is for workstation only
- `INQUIRY_HASH_SECRET` — required in production; local fallback to `JWT_SECRET` is for workstation only
- Prisma engine path overrides when `binaries.prisma.sh` is blocked

Frontend (`frontend/.env.local`):

- `NEXT_PUBLIC_API_URL` (local `http://localhost:3001/api`)
- `NEXT_PUBLIC_SITE_URL` (local `http://localhost:3000`; production public HTTPS origin)

Browser enquiry posts go to same-origin `/api/public/inquiries`. Next server
code uses `NEXT_PUBLIC_API_URL` to reach Nest.

## Safe local commands

```bash
pnpm --dir backend exec prisma migrate deploy
pnpm --dir backend exec prisma generate
pnpm --dir backend test
pnpm --dir backend test:e2e
pnpm --dir backend build
pnpm --dir backend start:prod

pnpm --dir frontend exec tsc --noEmit
pnpm --dir frontend build
# Only if port 3000 is free and next dev is not running:
pnpm --dir frontend start
```

## Manual steps before any production rollout

1. Confirm target app ports are free.
2. Copy env files on the server; do not reuse local secrets.
3. Back up production Postgres, then `prisma migrate deploy`.
4. Seed admin once; keep seed idempotent.
5. Set `CORS_ORIGIN` and `NEXT_PUBLIC_SITE_URL` to the public HTTPS origin.
   Set dedicated `JWT_SECRET`, `JWT_REFRESH_SECRET`, `MEDIA_SIGNING_SECRET`, and
   `INQUIRY_HASH_SECRET`. Do not reuse local secrets. Do not rely on JWT fallback.
6. Keep `MEDIA_ROOT` off the public web tree.
7. Install `sharp` on the server only if registry/ACL allows it; otherwise keep the PNG fallback.
8. Reverse-proxy `/` to Next; do not expose Nest publicly if avoidable.
9. Use `ecosystem.config.cjs` with PM2 (`node dist/main.js` and `next start`). Keep `instances: 1` until Redis backs rate limits.
10. Install the Nginx template in `docs/nginx/parvanerazaghiart.conf` after TLS files exist.
11. Follow `docs/PRISMA_LINUX.md`: `prisma generate` on Linux, then `prisma migrate deploy` only.

## Intentionally deferred

- Production SSH, deploy, restart, and live migration
- `sharp` on this Windows workstation (npm registry `EACCES`)
- SMTP delivery of enquiries (Postgres + admin UI instead)
