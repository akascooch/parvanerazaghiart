import { NextRequest, NextResponse } from 'next/server';
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE,
  cookieOptions,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
} from '@/lib/auth-cookies';
import { backendUrl } from '@/lib/backend';
import { isAccessTokenExpired } from '@/lib/jwt-expiry';
import { publicAbsoluteUrl } from '@/lib/public-origin';

async function rotateRefresh(refreshToken: string) {
  const upstream = await fetch(backendUrl('/auth/refresh'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
    cache: 'no-store',
  });
  if (!upstream.ok) {
    return null;
  }
  return (await upstream.json()) as {
    accessToken: string;
    refreshToken: string;
  };
}

function withRotatedCookies(
  response: NextResponse,
  tokens: { accessToken: string; refreshToken: string },
) {
  response.cookies.set(
    ACCESS_COOKIE,
    tokens.accessToken,
    cookieOptions(ACCESS_MAX_AGE),
  );
  response.cookies.set(
    REFRESH_COOKIE,
    tokens.refreshToken,
    cookieOptions(REFRESH_MAX_AGE),
  );
  return response;
}

function clearAndLogin(request: NextRequest) {
  const login = publicAbsoluteUrl(request, '/admin/login');
  login.searchParams.set('from', request.nextUrl.pathname);
  const response = NextResponse.redirect(login);
  response.cookies.set(ACCESS_COOKIE, '', cookieOptions(0));
  response.cookies.set(REFRESH_COOKIE, '', cookieOptions(0));
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  const accessValid = Boolean(accessToken) && !isAccessTokenExpired(accessToken!);

  if (pathname === '/admin/login') {
    if (accessValid) {
      return NextResponse.redirect(publicAbsoluteUrl(request, '/admin'));
    }
    if (refreshToken) {
      const tokens = await rotateRefresh(refreshToken);
      if (tokens) {
        return withRotatedCookies(
          NextResponse.redirect(publicAbsoluteUrl(request, '/admin')),
          tokens,
        );
      }
    }
    return NextResponse.next();
  }

  if (accessValid) {
    return NextResponse.next();
  }

  if (refreshToken) {
    const tokens = await rotateRefresh(refreshToken);
    if (tokens) {
        return withRotatedCookies(
          NextResponse.redirect(
            publicAbsoluteUrl(
              request,
              `${request.nextUrl.pathname}${request.nextUrl.search}`,
            ),
          ),
          tokens,
        );
    }
  }

  return clearAndLogin(request);
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
