# Prisma on Linux (production)

Generate and deploy Prisma engines **on the Linux host** (or in a Linux CI
image that matches the server). Windows-downloaded engines (`query_engine.dll.node`,
`schema-engine.exe`) will not run on Linux.

Never run these commands against production from a developer laptop unless that
is an intentional, approved operations window. This repository does not SSH to
production.

## 1. Environment

From the `backend/` directory, with production `DATABASE_URL` loaded (do not
print it):

```bash
export NODE_ENV=production
cd backend
```

If the host cannot reach `binaries.prisma.sh`, set engine paths **after** a
successful local Linux generate, for example:

```bash
export PRISMA_ENGINES_CHECKSUM_IGNORE_CHECKS=1
# export PRISMA_QUERY_ENGINE_LIBRARY=/absolute/path/libquery_engine-debian-openssl-3.0.x.so.node
# export PRISMA_SCHEMA_ENGINE_BINARY=/absolute/path/schema-engine
```

Optional `schema.prisma` hardening for mixed Windows-dev / Debian-prod:

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "debian-openssl-3.0.x"]
}
```

Apply `binaryTargets` only when you can download both engines. OpenSSL 1.1 hosts
use `debian-openssl-1.1.x` instead.

## 2. Generate the Linux client

```bash
pnpm exec prisma generate
```

This compiles/copies the native query engine for the current OS. Run it after
every `pnpm install` on the server and after changing `schema.prisma`.

## 3. Deploy migrations (safe)

Back up PostgreSQL first. Then:

```bash
pnpm exec prisma migrate deploy
```

`migrate deploy` applies pending SQL from `prisma/migrations/` and does not
reset data.

## 4. Forbidden on production

Do **not** run:

- `prisma migrate reset` — drops the database
- `prisma migrate dev` — interactive, can create new migrations and prompt
- `prisma db push` — bypasses migration history

## 5. Seed

Seed only when the operator explicitly intends to create/update the admin user.
The seed script must stay idempotent.

```bash
pnpm exec prisma db seed
```
