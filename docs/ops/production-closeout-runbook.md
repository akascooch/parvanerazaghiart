# Production closeout runbook (2026-11-10)

Verified operational state after the Iran dual-path outage recovery. No credentials, private keys, or ledger rows are stored here.

## Architecture (live)

```
Cloudflare (Full Strict, Origin CA on origin)
  → Nginx :80/:443
    → Next.js BFF 127.0.0.1:3000  (public site + /api/*)
      → NestJS     127.0.0.1:3001
    → Bendaaz      127.0.0.1:3005  via /bendaaz-app
PostgreSQL 127.0.0.1:5432  (databases: parvanerazaghiart, bendaaz_db)
SSH 3031/tcp
```

PM2 user: `parvane` · mode: fork · `instances: 1`  
Apps: `parvanerazaghiart-web`, `parvanerazaghiart-api`, `bendaaz-web`

## Active release paths (as of closeout)

| Role | Path |
|---|---|
| `current` symlink | `/var/www/parvanerazaghiart/releases/cce59ed-hotfix` |
| Web process cwd | `.../cce59ed-hotfix/frontend` |
| API process cwd | `.../ed26ecb-api-pw/backend` |
| Shared media | `/var/www/parvanerazaghiart/shared/storage/media` |
| Bendaaz app | `/var/www/bendaaz/app` |
| Bendaaz uploads | `/var/www/bendaaz/storage/uploads` |

Intentional split: web and API currently run from different release directories. Always diff live trees before promoting a “clean” git archive.

## Client IP trust chain

1. Nginx `real_ip_header CF-Connecting-IP` with Cloudflare `set_real_ip_from` ranges only.
2. Public locations send `X-Forwarded-For $remote_addr` (**overwrite**, never `$proxy_add_x_forwarded_for`).
3. Direct-origin peers are not Cloudflare, so client-supplied `CF-Connecting-IP` is ignored.
4. Next login BFF (`frontend/src/lib/client-ip.ts`) forwards one validated IP to Nest.
5. Nest login throttle key = `${ip}:${identifier}`.

## Health paths

| Check | URL |
|---|---|
| Main (public) | `https://parvanerazaghiart.com/api/health` |
| Web loopback | `http://127.0.0.1:3000/api/health` |
| API loopback | `http://127.0.0.1:3001/api/health` |
| Bendaaz login | `https://parvanerazaghiart.com/bendaaz-app/login` |
| Bendaaz edge | `https://parvanerazaghiart.com/bendaaz-app/edge-health` |

## SSH / firewall (lockout recovery)

- SSH listens on **3031** (UFW allows 3031/80/443; 3000/3001/5432 denied publicly; apps bind loopback).
- **Never** `ufw reset` or default-deny without the 3031 allow rule already present.
- If SSH is unreachable after a firewall mistake: use the **provider VNC/KVM console**, fix UFW/`sshd`, confirm `ss -tulpn | grep 3031`, then reconnect.

## Boot persistence (verified without reboot)

| Unit | Boot | Notes |
|---|---|---|
| `ufw` | enabled | Rules in `/etc/ufw/user.rules` |
| `nginx` | enabled | `nginx -t` OK · Origin CA expires 2041-08-21 |
| `pm2-parvane` | enabled | Resurrected apps on last boot |
| `postgresql` | enabled | Loopback only |

Future controlled reboot checklist: provider maintenance window → console ready → reboot → confirm SSH 3031 → `ufw status` → `nginx -t` → `pm2 list` → curl health paths via Cloudflare and direct origin.

## Rollback (verified commands)

### Web

```bash
ln -sfn /var/www/parvanerazaghiart/releases/affd641 /var/www/parvanerazaghiart/current
sudo -u parvane -H pm2 delete parvanerazaghiart-web
sudo -u parvane -H pm2 start /var/www/parvanerazaghiart/releases/affd641/ecosystem.config.cjs --only parvanerazaghiart-web --env production
sudo -u parvane -H pm2 save
```

### API

```bash
sudo -u parvane -H pm2 delete parvanerazaghiart-api
sudo -u parvane -H pm2 start /var/www/parvanerazaghiart/releases/a889ee7/ecosystem.config.cjs --only parvanerazaghiart-api --env production
sudo -u parvane -H pm2 save
```

### Nginx

```bash
cp -a /var/backups/nginx/parvanerazaghiart.com.20261110T141203Z /etc/nginx/sites-available/parvanerazaghiart.com
nginx -t && systemctl reload nginx
```

### Bendaaz

Restore code from `/var/www/bendaaz/backups/app-pre-edit-20261110T131919Z` (or a dated `.tgz`), rebuild/restart `bendaaz-web` as `parvane`. Do not overwrite `.env` or `/var/www/bendaaz/storage`.

## Backup status (closeout finding)

| Asset | On-box copies | Scheduled | Off-server | Restore-tested |
|---|---|---|---|---|
| Main Postgres (`parvanerazaghiart`) | **None found** | No | No | No |
| Bendaaz Postgres | Custom dumps (2026-10-14), readable via `pg_restore -l` | No | No | No |
| Bendaaz app trees | Manual `.tgz` / pre-edit dir | No | No | No |
| Nginx vhost | `/var/backups/nginx/` | Manual | No | Syntax-only |
| Media / uploads | Live disks only | No | No | No |

**High priority plan (not implemented in this closeout):** nightly `pg_dump` for both DBs to an encrypted off-server target (object storage or second host), weekly media sync, retain ≥14 days, alert if backup age > 36h. Keep dump files mode `600`.

## Monitoring coverage (closeout finding)

Present today: Nginx access/error logs, PM2 status, ad-hoc `scripts/latency-check.sh`, provider console.

Missing: continuous public health probes, 522/502 alerting, disk/memory thresholds, SSL expiry warning (Origin CA is long-lived; edge cert is Cloudflare-managed), backup-failure alerts.

Suggested thresholds if lightweight checks are added later:

- Disk: warn 80% · critical 90% on `/`
- Public `/api/health` or `/bendaaz-app/edge-health`: critical after 3 consecutive failures
- PM2 restart count increase without deploy: warn
- Backup age: critical > 36h once a schedule exists

Alert destination: configure operator email/Telegram/SMS via the hosting provider or an existing TECHOOCH channel — do not invent credentials in-repo.

## Iran vs international verification

1. From an Iran network (or IR vantage): open `https://parvanerazhiart.com` and `/api/health` without VPN.
2. From outside Iran or via VPN: same URLs.
3. Optional direct-origin check (operators only): `curl --resolve parvanerazaghiart.com:443:<origin-ip> https://parvanerazaghiart.com/api/health`
4. Do not change Cloudflare proxy mode solely to “test” if both paths already return 200.

## Bendaaz auth note

Bendaaz uses a **single shared password** stored outside git under `/var/www/bendaaz/secrets/` (mode `600`). `scripts/qa-auth.mjs` is an automated QA **script**, not a separate user account. Transaction-edit smoke tests must create and delete only their own rows.

## Related docs

- `.cursor/rules/techooch-standard.mdc` — always-applied AI rule
- `docs/ops/master-prompt-protocol.md` — long-form protocol
- `docs/ops/iran-cloudflare-checklist.md` — Cloudflare dashboard toggles
- `docs/LINUX_RUNBOOK.md` — deploy script usage
- `docs/ops/bendaaz-transaction-edit-patch.md` — edit feature contract
