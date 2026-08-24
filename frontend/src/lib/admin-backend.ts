import { cookies } from 'next/headers';
import { ACCESS_COOKIE } from '@/lib/auth-cookies';
import { backendUrl } from '@/lib/backend';

export class AdminApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'AdminApiError';
  }
}

export async function adminBackend<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token = cookies().get(ACCESS_COOKIE)?.value;
  if (!token) {
    throw new AdminApiError(401, 'Unauthorized');
  }

  const response = await fetch(backendUrl(path), {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  const data = (await response.json().catch(() => ({}))) as {
    message?: string | string[];
  };

  if (!response.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message ?? 'Request failed';
    throw new AdminApiError(response.status, message);
  }

  return data as T;
}
