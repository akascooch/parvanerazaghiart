# Production closeout report — v2.2.0-brand-identity

**Project:** Parvaneh Razaghi Art Platform (`parvanerazaghiart`)  
**Standard:** TECHOOCH High-End Architecture & Elite Code Standards  
**Verdict:** PRODUCTION CLOSEOUT: **PASS**  
**Closeout date:** 2026-09-23

No secrets, private-key material, tokens, or environment values are included in this report.

---

## 1. Release metadata

| Field | Value |
|---|---|
| Version | `v2.2.0-brand-identity` |
| Live commit | `affd64106e89740789615ee31788ae39bbd2466c` |
| Short SHA | `affd641` |
| Branch | `main` |
| Production host | `parvanerazaghiart.com` (`85.208.253.56`) |
| Production app root | `/var/www/parvanerazaghiart` |
| Active release | `/var/www/parvanerazaghiart/releases/affd641` |
| `current` symlink | `/var/www/parvanerazaghiart/current` → `releases/affd641` |
| Next.js cwd | `/var/www/parvanerazaghiart/releases/affd641/frontend` |
| Rollback target | `/var/www/parvanerazaghiart/releases/cd18981` (`v2.1.0-passe-partout`) |
| Media | `/var/www/parvanerazaghiart/shared/storage/media` (symlink intact) |
| SSL / Nginx | Cloudflare Origin CA intact; live vhost not rewritten |
| Execution user | `parvane` (PM2); remote ops via SSH alias `parvane-prod` |

### PM2 cluster status (post-cutover)

| App | Role | Status | Restarts | Notes |
|---|---|---|---|---|
| `parvanerazaghiart-web` | Next.js BFF `:3000` | **online** | **0** | Reloaded from `affd641` |
| `parvanerazaghiart-api` | NestJS `:3001` | **online** | **0** | Left running; no API change |

`instances: 1` (fork) on both apps.

---

## 2. Brand identity revision

The prior header mark (`/newv/logo.jpg`) was a JPEG with a baked-in white bounding box. `.brand-mark { mix-blend-mode: multiply }` was a workaround that could muddy a true transparent PNG.

**v2.2.0** ships `frontend/public/newv/mainlogo.png` (1080×712, truecolor+alpha) as the single brand mark for header and hero.

| Surface | Before | After |
|---|---|---|
| Data source | `artistAssets.logo = '/newv/logo.jpg'` | `'/newv/mainlogo.png'` (1080×712) |
| `SiteHeader` | `<img>` + `brand-mark` (multiply) | `<img>` + `site-logo`; `alt="Parvaneh Razaghi Art"` |
| `HeroCinematic` | Typeset `<motion.h1>Parvaneh Razaghi</motion.h1>` | `<motion.h1 aria-label="Parvaneh Razaghi Art">` wrapping responsive `next/image` (`object-contain`) |
| `globals.css` | `.brand-mark { mix-blend-mode: multiply }` | `.site-logo { display: block }` |
| About / footer | Text name | **Unchanged** text “Parvaneh Razaghi” |

Touched files:

- `frontend/public/newv/mainlogo.png`
- `frontend/src/data/artist-data.ts`
- `frontend/src/components/public/SiteHeader.tsx`
- `frontend/src/components/public/HeroCinematic.tsx`
- `frontend/src/app/globals.css`

---

## 3. Live verification matrix

| Check | Result |
|---|---|
| Loopback `GET http://127.0.0.1:3000/api/health` | **HTTP/1.1 200 OK** |
| Public `GET https://parvanerazaghiart.com/` | **HTTP/2 200** |
| Public `GET https://parvanerazaghiart.com/about` | **HTTP/2 200** |
| Public `GET https://parvanerazaghiart.com/api/health` | **HTTP/2 200** |
| Public `GET https://parvanerazaghiart.com/newv/mainlogo.png` | **HTTP/2 200** |
| Live HTML `/newv/mainlogo.png` | **present** |
| Live HTML `/newv/logo.jpg` | **absent** |
| Live HTML `site-logo` | **present** |
| Live HTML `brand-mark` | **absent** |
| Hero `aria-label="Parvaneh Razaghi Art"` | **present** |
| About page text h1 “Parvaneh Razaghi” | **preserved** |
| TECHOOCH footer | **preserved** |

---

## 4. Rollback procedure (v2.2.0 → v2.1.0-passe-partout)

Previous immutable tree `releases/cd18981` is retained. One-line cutover (run as root on the production host):

```bash
ln -sfn /var/www/parvanerazaghiart/releases/cd18981 /var/www/parvanerazaghiart/current && sudo -u parvane -H pm2 delete parvanerazaghiart-web && sudo -u parvane -H pm2 start /var/www/parvanerazaghiart/releases/cd18981/ecosystem.config.cjs --only parvanerazaghiart-web --env production && sudo -u parvane -H pm2 save
```

Then confirm `curl -fsS http://127.0.0.1:3000/api/health`. Do **not** rewrite Nginx Origin CA. Do **not** `git pull` inside `current`.

---

## 5. Git

| Item | Result |
|---|---|
| Feature commit | `affd641` — `feat: upgrade branding to transparent PNG, update hero to logo` |
| Tag | `v2.2.0-brand-identity` (annotated, points at `affd641`) |
| Origin | `https://github.com/akascooch/parvanerazaghiart.git` |

---

## 6. Final verdict

**PRODUCTION CLOSEOUT: PASS**

Milestone **v2.2.0-brand-identity** is live at `parvanerazaghiart.com` on commit `affd641`. Header and hero use the transparent PNG brand mark with semantic accessibility. About and footer retain text wordmarks. Rollback to `cd18981` remains a symlink + PM2 web restart.

**TECHOOCH sign-off:** accepted 2026-09-23.
