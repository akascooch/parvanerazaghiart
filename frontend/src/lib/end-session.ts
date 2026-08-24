import { NextResponse } from 'next/server';
import {
  ACCESS_COOKIE,
  cookieOptions,
  REFRESH_COOKIE,
} from '@/lib/auth-cookies';
import { backendUrl } from '@/lib/backend';

export async function endAuthSession(
  response: NextResponse,
  refreshToken?: string,
): Promise<NextResponse> {
  if (refreshToken) {
    await fetch(backendUrl('/auth/logout'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    }).catch(() => undefined);
  }

  const expired = cookieOptions(0);
  response.cookies.set(ACCESS_COOKIE, '', expired);
  response.cookies.set(REFRESH_COOKIE, '', expired);
  return response;
}
