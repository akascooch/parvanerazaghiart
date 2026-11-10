import { isIP } from 'node:net';

/**
 * Nginx overwrites X-Forwarded-For with the Cloudflare-resolved client
 * address, so the first entry is trusted. Node runtime only.
 */
export function clientIpFrom(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (forwarded && isIP(forwarded)) return forwarded;
  const real = request.headers.get('x-real-ip')?.trim();
  if (real && isIP(real)) return real;
  return null;
}
