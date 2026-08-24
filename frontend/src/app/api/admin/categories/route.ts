import { NextResponse } from 'next/server';
import { proxyAdmin } from '@/lib/admin-bff';

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.toString();
  return proxyAdmin(`/admin/categories${query ? `?${query}` : ''}`);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  return proxyAdmin('/admin/categories', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
