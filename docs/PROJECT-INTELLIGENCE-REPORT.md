# Project Intelligence Report — Master Artist Platform

**Project:** Parvane Razaghi Art  
**Stack target:** NestJS + Next.js (App Router) + PostgreSQL/Prisma + Tailwind + Framer Motion  
**Constraint:** No feature code until approval. Phase 0-B (server) deferred.

---

## [A] Environment Summary

### Local (Phase 0-A verified)
- Windows 11 x64; Node 24.15.0 + npm + pnpm; Git installed (repo not initialized).
- PostgreSQL **17.10** running locally; DB `parvanerazaghiart` exists and is **empty**.
- Credentials documented in `Local Info.txt` (never commit).
- Docker not available; not required for local PG.

### Server (documented only — **not connected**)
- Production host / domain / SSH port / credentials: found in `Server Info.txt`.
- Domain: `parvanerazaghiart.com` (deploy in Phase 0-B after VPN allows access).
- No SSH, remote DB, or production probes performed in this phase.

### Implication
Develop fully against local PostgreSQL first; treat production as a later promote step with mirrored env vars (no secrets in Git).

---

## [B] Aesthetic Strategy — World-Class Design

### Competitive failures to avoid
| Failure | Why it hurts | Our counter |
|---------|--------------|-------------|
| Slow / blurry artwork images | Collectors bounce; trust collapses | Next.js Image + responsive variants + blur placeholders + CDN later |
| Cluttered first viewport | Brand diluted; feels like a marketplace | One composition: brand hero + one line + one CTA + full-bleed artwork |
| Card grids everywhere | Cheap “shop” feel | Card-free public gallery; immersion over tiles |
| Over-animation / gimmicks | Feels trendy, not gallery | 2–3 intentional Framer Motion beats; respect `prefers-reduced-motion` |
| Weak mobile nav | Most discovery is phone | Thumb-first nav, large hit targets, image-first scroll |
| Bloated admin UIs | Slow edits = stale catalogue | Sparse admin: list → detail → save; keyboard-friendly |

### Visual direction (public site)
- **Gallery posture:** quiet authority (Gagosian / Zwirner energy) — warm neutrals, expressive typography (not Inter/Roboto), artwork as the only hero.
- **Hero budget:** brand name dominant, one headline, one short line, one CTA group, edge-to-edge visual plane.
- **Motion:** slow “inhale” transitions (opacity/transform only), artwork reveal, subtle page choreography — no glow stacks, no purple AI defaults.
- **Content hierarchy:** Works → Work detail (material, size, year, availability) → About → Contact / inquiry. Optional exhibitions later.

### Admin aesthetic
- Dense but calm: data tables, filters, status chips only where they aid CRUD.
- Preview pane for artwork before publish.
- Clear publish / draft / sold states.

---

## [C] Technical Architecture

### Proposed monorepo layout (Phase 1+)

```
parvanerazaghiart/
├── frontend/                 # Next.js App Router
│   ├── app/
│   │   ├── (public)/         # gallery, work/[slug], about, contact
│   │   └── (admin)/admin/    # protected admin UI
│   ├── components/
│   ├── lib/                  # API client, auth helpers
│   └── public/
├── backend/                  # NestJS
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── artworks/
│   │   │   ├── categories/
│   │   │   ├── media/
│   │   │   ├── inquiries/
│   │   │   └── ledger/       # optional sales/transaction links
│   │   ├── prisma/
│   │   └── common/           # guards, filters, interceptors
│   └── prisma/schema.prisma
├── docs/
└── .gitignore
```

### Automated Admin Panel — feature logic
| Capability | Behavior |
|------------|----------|
| Artwork CRUD | Create/edit/archive; slug, titles (FA/EN if needed), dimensions, medium, year, description |
| Pricing toggle | `priceVisible` + optional `priceAmount` / `priceOnRequest`; never show raw price if toggled off |
| Dynamic categories | Nested or flat tags; reorder; soft-delete with artwork reassignment |
| Publish workflow | `draft` → `published` → `sold` / `unavailable`; public API filters published only |
| Media | Upload → store metadata + optimized URLs; primary + gallery images; sort order |
| Inquiries | Contact form → admin inbox; link to artwork |
| Ledger / transactions | Optional: external payment/invoice URL or manual sale record (amount, date, buyer note, artworkId) — not a full shop unless requested |

### Prisma schema overview (conceptual)

- **User** — admin accounts (role: ADMIN)
- **Artwork** — core catalogue fields + status + pricing flags + indexes on `slug`, `status`, `categoryId`, `createdAt`
- **Category** — name, slug, sortOrder
- **ArtworkImage** — url, alt, sortOrder, artworkId
- **Inquiry** — name, email, message, artworkId?, status
- **LedgerEntry** (optional) — artworkId, amount, currency, note, occurredAt, externalRef
- **RefreshToken** / session table if long-lived JWT + rotation

### Security & performance blueprint
- **Auth:** access JWT (short) + refresh token (long-lived, rotated, hashed at rest); HttpOnly cookies for admin web; CSRF for cookie flows.
- **Images:** never store binaries in Postgres; local `uploads/` in Phase 1, object storage in Phase 0-B/prod; Next.js image optimization + WebP/AVIF.
- **Indexing:** slug unique; composite `(status, categoryId)`; inquiry `createdAt`.
- **API:** NestJS rate limits on public inquiry; Zod/class-validator DTOs; least-privilege DB user later.
- **Caching:** ISR/revalidate for public gallery pages; invalidate on publish.

---

## [D] Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Large unoptimized images | Slow LCP, mobile pain | Strict upload limits, server-side resize, CDN in prod |
| Node 24 vs LTS drift | Subtle CI/prod mismatch | Standardize on Node 22 LTS locally + engines field |
| Secrets in repo | Credential leak | `.gitignore` already covers Local/Server Info + `.env*` |
| Long-lived JWT alone | Stolen token = lasting access | Refresh rotation + revoke list / family invalidation |
| Admin on same origin without hardening | XSS → session theft | CSP, sanitized rich text, separate admin layout + auth guards |
| VPN blocks Phase 0-B | Delayed deploy | Ship local-complete MVP first; document server runbook offline |
| Scope creep into e-commerce | Delays gallery quality | Ledger as links/manual first; checkout only if approved |
| Empty monorepo without Git | No rollback | `git init` early, secret-safe first commit |

---

## [E] Step-by-Step Roadmap

| Phase | Focus | Deliverable |
|-------|--------|-------------|
| **0-A** | Local audit + skeleton | Done — this report + folders |
| **0-B** | Server (when VPN allows) | SSH hardening notes, Node/PG on VPS, domain, TLS — **no action now** |
| **1** | Scaffold | NestJS + Prisma + Next.js App Router + Tailwind + Framer Motion baselines |
| **2** | Auth + Admin shell | Login, JWT/refresh, protected `/admin` |
| **3** | Catalogue core | Categories + Artwork CRUD + media upload |
| **4** | Public gallery | Hero, grid/immersive browse, work detail, inquiry |
| **5** | Polish | Motion, SEO, image pipeline, pricing toggle UX |
| **6** | Ledger / ops | Transaction links, sold state, basic reporting |
| **7** | Deploy | Phase 0-B infra + env promotion + backups |

---

## Approval gate

Awaiting user / ChatGPT approval before:
- Scaffolding Next.js or NestJS
- Creating Prisma migrations
- Any remote/server work

**Recommended next message:** “Approve Phase 1 scaffold” (and optionally “use Node 22 LTS”).
