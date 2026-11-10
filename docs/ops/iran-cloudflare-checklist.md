# Cloudflare dashboard toggles (Iran + VPN dual-path)

Apply on the Cloudflare zone for `parvanerazaghiart.com` (covers `/bendaaz-app` under the same apex):

1. **0-RTT Connection Resumption** → **OFF**  
   Iranian DPI frequently drops early-data / 0-RTT packets. Keep TLS 1.3 on, 0-RTT off.
2. **Minimum TLS Version** → **TLS 1.2**
3. **TLS 1.3** → **ON** (with 0-RTT OFF)
4. **Brotli** → **ON**
5. Prefer **Full (strict)** SSL/TLS mode with the existing Origin CA cert on the VPS.
6. Do not enable experimental HTTP/3-only paths if you observe Iran clients failing; HTTP/2 via Cloudflare remains the primary path.

Origin notes (post-recovery, 2026-11-10):

- Live vhost uses Cloudflare Origin CA + `http2 on` (Nginx 1.28.x).
- Both `/` and `/bendaaz-app` send `X-Forwarded-For $remote_addr` (overwrite).
- Template reference only: `docs/nginx/parvanerazaghiart-iran-hardened.conf` — never replace the live Origin CA vhost blindly.
- Full ops/rollback: `docs/ops/production-closeout-runbook.md`.
