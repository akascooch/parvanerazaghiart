# Production closeout report — v2.1.0-passe-partout

**Project:** Parvaneh Razaghi Art Platform (`parvanerazaghiart`)  
**Standard:** TECHOOCH High-End Architecture & Elite Code Standards  
**Verdict:** PRODUCTION CLOSEOUT: **PASS**  
**Closeout date:** 2026-09-17

No secrets, private-key material, tokens, environment values, or dump contents are included in this report.

---

## 1. Release metadata

| Field | Value |
|---|---|
| Version | `v2.1.0-passe-partout` |
| Live commit | `cd18981e962836ded160e2c4779d98309f3c145b` |
| Short SHA | `cd18981` |
| Branch | `main` |
| Production host | `parvanerazaghiart.com` (`85.208.253.56`) |
| Production app root | `/var/www/parvanerazaghiart` |
| Active release | `/var/www/parvanerazaghiart/releases/cd18981` |
| `current` symlink | `/var/www/parvanerazaghiart/current` → `releases/cd18981` |
| Next.js cwd | `/var/www/parvanerazaghiart/releases/cd18981/frontend` |
| Rollback target | `releases/a889ee7` (`v2.0.0-haute-couture`) |
| Media | `/var/www/parvanerazaghiart/shared/storage/media` (symlink intact) |
| SSL / Nginx | Cloudflare Origin CA intact; `nginx -t` syntax ok |
| Execution user | `parvane` (PM2); remote ops via SSH alias `parvane-prod` |

### PM2 cluster status (post-cutover)

| App | Role | Status | Restarts | Notes |
|---|---|---|---|---|
| `parvanerazaghiart-web` | Next.js BFF `:3000` | **online** | **0** | Reloaded from `cd18981` |
| `parvanerazaghiart-api` | NestJS `:3001` | **online** | **0** | Unchanged binary; left running |

`instances: 1` (fork) on both apps. There is no process named `parvanerazaghi-frontend`.

---

## 2. The art-direction fix (Museum Passe-Partout)

Catalog thumbnails previously forced every work into a **portrait 4:5 hole** and filled it with **`object-cover`**. Landscape **Light** (`1080×632`) lost left/right canvas; near-square **Studio Studies** (`2927×2915`) lost top/bottom. Hover `scale-[1.025]` zoomed further into the crop. `overflow-hidden` hid the clipped pixels.

**v2.1.0** keeps the **4:5 parchment well** so the 2/3-column grid rhythm is unchanged, and places the bitmap inside it with **`object-contain`**.

| Surface | Before | After |
|---|---|---|
| `ArtworkCard` frame | Image itself `aspect-[4/5] object-cover` | Figure is the matte: `aspect-[4/5] bg-parchment flex items-center justify-center p-4 sm:p-5` |
| Catalog image | `object-cover` + `group-hover:scale-[1.025]` | `object-contain max-h-full max-w-full min-h-0 min-w-0`; hover `border-gold/30 shadow-lg` |
| Lightbox filmstrip | `aspect-[4/5] object-cover` | Same parchment well + contain |
| Lightbox stage | `object-contain` (already uncropped) | `mx-auto max-h-[86vh] w-auto max-w-full object-contain` |
| Geometry | CSS 4:5 overrode HTML width/height | `mediaAspectStyle(width, height)` → `aspect-ratio: W / H` |

**Zero pixel cropping:** letterboxing (parchment visible around landscape or square works) is the museum matte, not a clip. Portraits, atelier stills, and Ambient Cinema remain `object-cover` on purpose.

Touched files:

- `frontend/src/components/public/ArtworkCard.tsx`
- `frontend/src/components/gallery/ArtworkLightbox.tsx`
- `frontend/src/components/gallery/GalleryImage.tsx`

---

## 3. Live verification matrix

| Check | Result |
|---|---|
| Loopback `GET http://127.0.0.1:3000/api/health` | **HTTP/1.1 200 OK** `{"web":"ok","api":{"status":"ok",...}}` |
| Public `GET https://parvanerazaghiart.com/api/health` | **HTTP/2 200** |
| Public `GET https://parvanerazaghiart.com/` | **HTTP/2 200** |
| Public `GET https://parvanerazaghiart.com/gallery` | **HTTP/2 200** |
| Nginx syntax | **ok** / test successful |
| Media symlink | **intact** (`shared/storage/media`) |
| Origin CA vhost | **not rewritten** |

### Visual confirmation (live `/gallery` HTML)

| Signal | Observed |
|---|---|
| `object-contain` | **present** |
| `bg-parchment` | **present** |
| `aspect-[4/5]` (matte window) | **present** |
| `group-hover:border-gold/30` | **present** |
| `object-cover` on catalog cards | **absent** |
| `scale-[1.025]` | **absent** |
| Light intrinsic size | `width="1080"` (landscape 1080×632, uncropped in matte) |
| Studio Studies intrinsic size | `width="2927"` (square 2927×2915, uncropped in matte) |

TECHOOCH footer (`Powered by TECHOOCH` → `instagram.com/techooch`) is unchanged.

---

## 4. Rollback procedure (v2.1.0 → v2.0.0-haute-couture)

Previous immutable tree `releases/a889ee7` is retained. One-line cutover (run as root on the production host):

```bash
ln -sfn /var/www/parvanerazaghiart/releases/a889ee7 /var/www/parvanerazaghiart/current && sudo -u parvane -H pm2 delete parvanerazaghiart-api parvanerazaghiart-web && sudo -u parvane -H pm2 start /var/www/parvanerazaghiart/releases/a889ee7/ecosystem.config.cjs --env production && sudo -u parvane -H pm2 save
```

Then confirm `curl -fsS http://127.0.0.1:3000/api/health`. Do **not** rewrite Nginx Origin CA. Do **not** `git pull` inside `current`.

---

## 5. Local archive inventory

Generated 2026-09-17 into `C:\scooch\parvanerazaghiart\backup` (gitignored). Zip is a `git archive` of `cd18981` (no `node_modules`, no `.next`, no `.git` directory).

| Artifact | Absolute path | Bytes | Timestamp | MD5 |
|---|---|---|---|---|
| PostgreSQL dump | `C:\scooch\parvanerazaghiart\backup\db_dump_v2.1.0_20260917T140224Z.sql` | 33,609 | 2026-09-17 17:32:41 | `1152D8D869DC9BAA4022E4C613765243` |
| Source zip | `C:\scooch\parvanerazaghiart\backup\parvanerazaghiart_v2.1.0_20260917_173137.zip` | 72,972,908 | 2026-09-17 17:31:39 | `68CDC875ADFD58BC2CB1E2293F15B6B5` |

Keep this folder off remotes and unencrypted removable media.

---

## 6. Git

| Item | Result |
|---|---|
| Commit | `cd18981` on `main` |
| Tag | `v2.1.0-passe-partout` (annotated) |
| Origin | `https://github.com/akascooch/parvanerazaghiart.git` |
| Remote `main` | `cd18981e962836ded160e2c4779d98309f3c145b` |
| Remote tag | present (`refs/tags/v2.1.0-passe-partout`) |

---

## 7. Final verdict

**PRODUCTION CLOSEOUT: PASS**

Milestone **v2.1.0-passe-partout** is live at `parvanerazaghiart.com` on commit `cd18981`. Catalog works render 100% of their canvas inside a luxury parchment matte. Rollback to `a889ee7` remains a symlink + PM2 restart.

**TECHOOCH sign-off:** accepted 2026-09-17.
