# Linux production runbook (cold start)

Do **not** run this against production from a developer laptop unless an
operations window is approved. This repository never SSHs to the server by
itself.

Architecture: Nginx (public TLS) → Next.js `127.0.0.1:3000` (including `/api/*`)
→ NestJS `127.0.0.1:3001`. Nest is loopback-only.

## 0. One-time server packages

Node 20 LTS, pnpm, PM2, Nginx, PostgreSQL (and `postgresql-client` for `psql`).
Issue TLS certificates before enabling `docs/nginx/parvanerazaghiart.conf`.

```bash
sudo npm i -g pnpm pm2
# postgres, nginx: distro packages
pm2 startup   # follow the printed systemd command once
```

## 1. Checkout

Clone or unpack the release on the Linux host. Do not copy Windows
`prisma-engines-manual/` or `node_modules/`.

## 2. Secrets

```bash
cd /path/to/parvanerazaghiart
chmod +x scripts/deploy.sh scripts/init-prod-env.sh
SITE_URL=https://parvanerazaghiart.com \
CORS_ORIGIN=https://parvanerazaghiart.com \
./scripts/init-prod-env.sh
```

Edit `backend/.env.production`: set a real `DATABASE_URL` (do not reuse the
workstation DSN or workstation JWT). Keep `HOST=127.0.0.1`.
`MEDIA_SIGNING_SECRET` and `INQUIRY_HASH_SECRET` are already independent —
do not point them at `JWT_SECRET`.

Seed the admin user once (`pnpm --dir backend exec prisma db seed`) only after
migrate, with production `ADMIN_*` values in the env used by the seed script.

## 3. Media and logs

On the production host, uploads live in shared storage, not inside a
single release tree:

```bash
# created/linked by scripts/deploy.sh on /var/www/parvanerazaghiart/releases/*
# /var/www/parvanerazaghiart/shared/storage/media
# backend/storage/media -> that shared directory
```

Workstation / non-release checkouts still use `backend/storage/media` as
a normal directory. `MEDIA_ROOT` must stay outside the Nginx document root.

## 4. Deploy

Back up PostgreSQL first. Optional pre-flight (no mutate):

```bash
./scripts/deploy.sh --check
```

Then:

```bash
./scripts/deploy.sh
```

The script: checks `node`/`pnpm`/`pm2`/`curl` (nginx/psql/openssl are
warnings if missing). Frozen installs, Linux `prisma generate` via
`pnpm exec`, `prisma migrate deploy` (abort on failure before build/PM2),
builds both apps, links persistent media, then reloads
`parvanerazaghiart-api` and `parvanerazaghiart-web` (`instances: 1` is
intentional — in-process rate limits). If PM2 cwd is already this
release, `startOrReload` is used; a new release directory does delete +
start so cwd follows `ecosystem.config.cjs`. Then loopback health on
`:3000/api/health` and `:3001/api/health`. After health, `current` is
pointed at this tree. Failed health is **not** auto-rolled-back; restore
the previous release directory and rerun deploy.

`./scripts/deploy.sh --check` validates env and paths only.

There is no automatic rollback. Use git tags / release directories.

Optional image optimization: `INSTALL_SHARP=1 ./scripts/deploy.sh`
(see `docs/IMAGE_PIPELINE.md`).

## 5. Nginx (after certificates exist)

Copy `docs/nginx/parvanerazaghiart.conf`, replace TEMPLATE certificate paths,
`nginx -t`, then reload. Do not proxy public `/api` to Nest.

## 6. Prisma rules

See `docs/PRISMA_LINUX.md`. Production: `migrate deploy` only.
Never `migrate reset` / `migrate dev`.

## 7. Verify

```bash
curl -fsS http://127.0.0.1:3000/api/health
curl -fsS http://127.0.0.1:3001/api/health
pm2 list
```

Public origin must match `NEXT_PUBLIC_SITE_URL`. Rebuild frontend after
changing any `NEXT_PUBLIC_*` value.
