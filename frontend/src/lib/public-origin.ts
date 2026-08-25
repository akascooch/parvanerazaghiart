import type { NextRequest } from 'next/server';

function firstHeader(value: string | null) {
  return value?.split(',')[0]?.trim() || '';
}

function isLoopbackHost(host: string) {
  const hostname = host.split(':')[0].toLowerCase();
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname === '[::1]'
  );
}

export function publicOrigin(request: NextRequest) {
  const forwardedHost = firstHeader(request.headers.get('x-forwarded-host'));
  const host = forwardedHost || firstHeader(request.headers.get('host'));
  const forwardedProto = firstHeader(request.headers.get('x-forwarded-proto'));
  const site = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');

  if (host && !isLoopbackHost(host)) {
    const proto = forwardedProto || (isLoopbackHost(host) ? 'http' : 'https');
    return `${proto}://${host}`;
  }

  if (site) {
    try {
      if (!isLoopbackHost(new URL(site).host)) {
        return site;
      }
    } catch {
      /* ignore malformed NEXT_PUBLIC_SITE_URL */
    }
  }

  return request.nextUrl.origin;
}

export function publicAbsoluteUrl(request: NextRequest, pathname: string) {
  return new URL(pathname, `${publicOrigin(request)}/`);
}
