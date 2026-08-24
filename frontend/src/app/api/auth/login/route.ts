import { NextResponse } from 'next/server';
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE,
  cookieOptions,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
} from '@/lib/auth-cookies';
import { backendUrl } from '@/lib/backend';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  const upstream = await fetch(backendUrl('/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const data = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
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
