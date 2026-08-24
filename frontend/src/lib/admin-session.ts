import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { ACCESS_COOKIE } from '@/lib/auth-cookies';
import { backendUrl } from '@/lib/backend';
import type { AuthUser } from '@/types';

export const getAdminSession = cache(async (): Promise<AuthUser | null> => {
  const accessToken = cookies().get(ACCESS_COOKIE)?.value;
  if (!accessToken) {
    return null;
  }

  const response = await fetch(backendUrl('/auth/me'), {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { user?: AuthUser };
  return data.user ?? null;
});

export async function requireAdminSession(): Promise<AuthUser> {
  const user = await getAdminSession();
  if (!user) {
    redirect('/api/auth/session/end');
  }
  return user;
}
