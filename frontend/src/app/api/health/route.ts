import { NextResponse } from 'next/server';
import { backendUrl } from '@/lib/backend';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const upstream = await fetch(backendUrl('/health'), { cache: 'no-store' });
    const api = await upstream.json().catch(() => ({ status: 'unreachable' }));
    return NextResponse.json(
      { web: 'ok', api },
      {
        status: upstream.ok ? 200 : 503,
        headers: { 'Cache-Control': 'private, no-store' },
      },
    );
  } catch {
    return NextResponse.json(
      { web: 'ok', api: { status: 'unreachable' } },
      {
        status: 503,
        headers: { 'Cache-Control': 'private, no-store' },
      },
    );
  }
}
