import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE,
  cookieOptions,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
} from '@/lib/auth-cookies';
import { backendUrl } from '@/lib/backend';

export async function POST() {
  const refreshToken = cookies().get(REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const upstream = await fetch(backendUrl('/auth/refresh'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
    cache: 'no-store',
  });

  const data = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    const response = NextResponse.json(data, { status: upstream.status });
    response.cookies.delete(ACCESS_COOKIE);
    response.cookies.delete(REFRESH_COOKIE);
    return response;
  }

  const response = NextResponse.json({ user: data.user });
  response.cookies.set(
    ACCESS_COOKIE,
    data.accessToken,
    cookieOptions(ACCESS_MAX_AGE),
  );
  response.cookies.set(
    REFRESH_COOKIE,
    data.refreshToken,
    cookieOptions(REFRESH_MAX_AGE),
  );
  return response;
}
