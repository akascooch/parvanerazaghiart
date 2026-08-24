import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { REFRESH_COOKIE } from '@/lib/auth-cookies';
import { endAuthSession } from '@/lib/end-session';

export async function GET(request: NextRequest) {
  const refreshToken = cookies().get(REFRESH_COOKIE)?.value;
  const login = new URL('/admin/login', request.url);
  login.searchParams.set('reason', 'session');
  const response = NextResponse.redirect(login);
  return endAuthSession(response, refreshToken);
}
