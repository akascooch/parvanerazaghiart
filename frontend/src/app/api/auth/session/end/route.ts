import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { REFRESH_COOKIE } from '@/lib/auth-cookies';
import { endAuthSession } from '@/lib/end-session';
import { publicAbsoluteUrl } from '@/lib/public-origin';

export async function GET(request: NextRequest) {
  const refreshToken = cookies().get(REFRESH_COOKIE)?.value;
  const login = publicAbsoluteUrl(request, '/admin/login');
  login.searchParams.set('reason', 'session');
  const response = NextResponse.redirect(login);
  return endAuthSession(response, refreshToken);
}
