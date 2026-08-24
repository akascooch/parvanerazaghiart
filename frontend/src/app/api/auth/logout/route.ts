import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { REFRESH_COOKIE } from '@/lib/auth-cookies';
import { endAuthSession } from '@/lib/end-session';

export async function POST() {
  const refreshToken = cookies().get(REFRESH_COOKIE)?.value;
  const response = NextResponse.json({ success: true });
  return endAuthSession(response, refreshToken);
}
