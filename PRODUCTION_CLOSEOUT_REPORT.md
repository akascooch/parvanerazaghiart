# Production closeout report — parvanerazaghiart.com

**Milestone:** `v2.0.0-haute-couture`  
**Verdict:** PRODUCTION CLOSEOUT: **PASS**

No secrets, private-key material, tokens, or environment values are included in this report.

---

## 1. Release milestone

| Field | Value |
|---|---|
| Live commit | `a889ee77e01a8f7e91abc476ca0239deba7cdcdb` |
| Short SHA | `a889ee7` |
| Release tag | `v2.0.0-haute-couture` |
| Branch | `main` |
| Production host | `parvanerazaghiart.com` (`85.208.253.56`) |
| Production app root | `/var/www/parvanerazaghiart` |
| Active release | `/var/www/parvanerazaghiart/releases/a889ee7` |
| `current` symlink | `/var/www/parvanerazaghiart/current` → `releases/a889ee7` |
| Rollback target | `releases/2ab895e` (`2ab895e` / prior live tree) |
| Git root (workstation) | `C:\scooch\parvanerazaghiart` |
| Closeout date | 2026-09-16 |
| Execution user | `parvane` (PM2); remote ops via SSH alias `parvane-prod` |

---

## 2. Deployment strategy

| Topic | Record |
|---|---|
| Strategy | Non-destructive immutable release directory tree (`releases/<sha>`) |
| Overlay | `git archive a889ee7` tarball extracted to `releases/a889ee7` (not `git pull` on `current`) |
| Media preservation | Symlink `releases/a889ee7/storage/media` → `/var/www/parvanerazaghiart/shared/storage/media` **intact** |
| SSL / Nginx | Cloudflare Origin CA **intact**; `nginx -t` syntax verified; live vhost **not** overwritten by repo Let’s Encrypt template |
| Rollback SLA | Instant `current` symlink switch to `releases/2ab895e` (**< 5 seconds**), then PM2 restart against that cwd |
| Process manager | PM2 `parvanerazaghiart-web` + `parvanerazaghiart-api`, `instances: 1` |

---

## 3. Runtime verification (live)

| Check | Result |
|---|---|
| NestJS (`parvanerazaghiart-api`) | **online** |
| Next.js (`parvanerazaghiart-web`) | **online** |
| PM2 restart count (both apps, post-cutover) | **0** |
| Loopback Next.js `http://127.0.0.1:3000/` | **200** |
| Public `/api/health` | **200** `{ "web": "ok", "api": "ok" }` |
| Public `/` `/gallery` `/about` `/contact` | **200** |
| Cormorant Garamond | **active** in live `/_next/static/css` |
| Inter | **active** in live `/_next/static/css` |
| Ambient cinema canvas | **active** (`/newv/5852479938275320255.mp4` in hero) |
| TECHOOCH footer / `/about` | **present** |
| Resume email leak | **none** |

Traffic path unchanged: **Cloudflare (Full Strict)** → Nginx `:443` (Origin CA) → Next.js BFF `127.0.0.1:3000` (including `/api/*`) → NestJS `127.0.0.1:3001`. PostgreSQL remains loopback-only.

---

## 4. Architecture / status summary

Public HTTPS and `/api/health` return **200** with both web and API healthy. Origin certificate is Cloudflare Origin CA; browsers see the Cloudflare edge certificate. NestJS is not public. Redis is not required by this application.

Prior infrastructure closeout (2026-08-25) remains valid for Origin CA paths, TLS 1.2/1.3, HTTP→HTTPS redirects, bind exposure (3000/3001/5432 loopback; 80/443 public; SSH 3031), and unused self-signed files **preserved and not in use**.

---

## 5. Git security result (unchanged since 2026-08-25)

| Check | Result | Classification |
|---|---|---|
| Origin CA material in Git history | **No matches** | SAFE |
| Tracked `*.pem` / `*.key` / `*.crt` / `*.pfx` / `*.p12` | **None** | SAFE |
| Closeout documents | Contain **no** secrets | SAFE |

Local Origin CA backups remain off-repo under `C:\scooch\_secure-local-backups\parvanerazaghiart\` (not Git).

---

## 6. Rollback runbook (v2 → v1.1.0 tree)

1. Point `current` at `/var/www/parvanerazaghiart/releases/2ab895e`.
2. Restart PM2 apps with cwd `releases/2ab895e` (same `ecosystem.config.cjs` names).
3. Confirm loopback `/` and public `/api/health` **200**.
4. Do **not** rewrite Nginx Origin CA.

Expected cutover: **< 5 seconds** for the symlink switch.

---

## 7. Skipped actions and reasons

| Skipped | Reason |
|---|---|
| Nginx vhost rewrite | Origin CA live config is correct; repo template uses Let’s Encrypt paths and must not replace it |
| Media copy into the release tree | Shared symlink already serves `/storage/media` |
| `git pull` inside `current` | `current` is not a Git checkout |
| Admin credential re-test | Customer sign-off items remain on `CUSTOMER_ACCEPTANCE_CHECKLIST.md` section C |
| HSTS preload | Not enabled; out of scope |
| Redis install | Not part of the running application |

---

## 8. Final verdict

**PRODUCTION CLOSEOUT: PASS**

Milestone **v2.0.0-haute-couture** is live at `parvanerazaghiart.com` on commit `a889ee7`, tag `v2.0.0-haute-couture`, rollback ready at `releases/2ab895e`.

**TECHOOCH sign-off:** accepted 2026-09-16.
