# Parvane Razaghi Art — Master Artist Platform

High-end digital gallery + automated admin panel.

## Stack (planned)

| Layer | Technology |
|-------|------------|
| Frontend | Next.js (App Router, Server Components) + Tailwind CSS + Framer Motion |
| Backend | NestJS |
| Database | PostgreSQL + Prisma ORM |

## Repository layout

```
parvanerazaghiart/
├── frontend/    # Next.js (Phase 1+)
├── backend/     # NestJS (Phase 1+)
├── docs/        # Architecture & phase reports
└── README.md
```

## Local prerequisites

- Node.js LTS (20.x or 22.x recommended)
- pnpm or npm
- PostgreSQL 17 (local)
- Git

Credentials and connection details: see `Local Info.txt` (never commit).

## Status

**Phase 0-A (Local foundation)** — complete.  
**Phase 0-B (Server)** — deferred (VPN / remote access).  
**Phase 1 (Scaffold)** — NestJS + Prisma + Next.js App Router initialized.  

Local ports: frontend `3000` · backend `3001`.

```bash
pnpm --dir backend start:dev
pnpm --dir frontend dev
```

## Security

Do not commit `.env*`, `Local Info.txt`, or `Server Info.txt`.
