import { NextResponse } from 'next/server';
import { backendUrl } from '@/lib/backend';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  const forwarded = request.headers.get('x-forwarded-for') ?? '';
  const upstream = await fetch(backendUrl('/public/inquiries'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Forwarded-For': forwarded || '127.0.0.1',
      'User-Agent': request.headers.get('user-agent') ?? 'gallery-web',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
