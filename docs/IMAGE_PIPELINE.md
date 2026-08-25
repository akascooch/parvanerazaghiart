# Linux image pipeline (optional `sharp`)

Public gallery images are never served as raw originals from a web root.
Browsers receive HMAC-signed URLs through Next (`/api/public/media/:id/:variant`)
which proxy Nest. Draft, deleted, and unsigned paths return 404.

## What happens today (Windows and Linux)

`backend/src/media/image-processor.ts` tries a dynamic `import("sharp")`.

1. If `sharp` loads, JPEG/PNG/WebP uploads are resized and encoded as WebP
   (quality 82, longest edge: thumb 480 / preview 1280 / full 2400).
2. If `sharp` is missing or throws, PNG originals are resized with the
   in-repo PNG codec. JPEG/WebP originals are **passed through** (same bytes,
   same MIME). That delivery is authenticated/signed, but it is **not**
   optimized. Do not call passthrough “optimized”.

`backend/package.json` does **not** depend on `sharp`, so Windows installs
stay intact when `sharp` native bindings cannot compile or the registry
blocks the package.

## Optional Linux install (does not affect Windows lockfile unless committed)

On the Ubuntu/Debian host only, after `pnpm --dir backend install --frozen-lockfile`:

```bash
# Optional. Rebuilds Linux binaries for the current glibc/OpenSSL.
pnpm --dir backend add sharp
pnpm --dir backend exec prisma generate
pnpm --dir backend build
pm2 startOrReload ecosystem.config.cjs --env production --update-env
```

Or set `INSTALL_SHARP=1` when running `scripts/deploy.sh` (this updates
`backend/package.json` / lockfile on the server; do not copy that lockfile
back to Windows unless you intend a cross-platform optional dependency).

Safer long-term: keep `sharp` out of the committed lockfile and install it
as a server-only extra. The app already treats a failed import as a fallback.

## Fallback guarantees

- Magic-byte checks still reject non-images.
- Size cap remains 12 MiB; max 12 images per artwork.
- Signed URL + published/sold + not-deleted checks still apply.
- Storage stays under `MEDIA_ROOT` with path-traversal guards.
- Production releases symlink `backend/storage/media` to
  `/var/www/parvanerazaghiart/shared/storage/media` so uploads survive
  new release directories (`scripts/deploy.sh` creates the link).
- If derivation fails, Nest streams the stored original through the same
  signed public route (passthrough). Clients still cannot list or fetch
  unsigned objects.

## Recommendation

Install `sharp` on Linux when the host can reach the npm registry. Until then,
treat large JPEG previews as performance debt, not a functional outage.
