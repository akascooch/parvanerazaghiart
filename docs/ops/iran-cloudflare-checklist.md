# Cloudflare dashboard toggles (Iran + VPN dual-path)

Apply on the Cloudflare zone for `parvanerazaghiart.com` (covers `/bendaaz-app` under the same apex):

1. **0-RTT Connection Resumption** → **OFF**  
   Iranian DPI frequently drops early-data / 0-RTT packets. Keep TLS 1.3 on, 0-RTT off.
2. **Minimum TLS Version** → **TLS 1.2**
3. **TLS 1.3** → **ON** (with 0-RTT OFF)
4. **Brotli** → **ON**
5. Prefer **Full (strict)** SSL/TLS mode with the existing Origin CA cert on the VPS.
6. Do not enable experimental HTTP/3-only paths if you observe Iran clients failing; HTTP/2 via Cloudflare remains the primary path.

Origin Nginx hardening artifact (ready, not live-applied while host is down):

- `docs/nginx/parvanerazaghiart-iran-hardened.conf`
