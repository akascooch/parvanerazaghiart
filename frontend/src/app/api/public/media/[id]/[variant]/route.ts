import { NextResponse } from 'next/server';
import { backendUrl } from '@/lib/backend';

export async function GET(
  request: Request,
  { params }: { params: { id: string; variant: string } },
) {
  const signature = new URL(request.url).searchParams.get('s') ?? '';
  const ifNoneMatch = request.headers.get('if-none-match');
  const upstream = await fetch(
    backendUrl(
      `/public/media/${params.id}/${params.variant}?s=${encodeURIComponent(signature)}`,
    ),
    {
      cache: 'no-store',
      headers: ifNoneMatch ? { 'If-None-Match': ifNoneMatch } : undefined,
    },
  );

  const cacheControl =
    upstream.headers.get('cache-control') ??
    'public, max-age=86400, stale-while-revalidate=604800';
  const etag = upstream.headers.get('etag');
  const common = {
    'Cache-Control': cacheControl,
    'X-Content-Type-Options': 'nosniff',
    ...(etag ? { ETag: etag } : {}),
  };

  if (upstream.status === 304) {
    return new NextResponse(null, { status: 304, headers: common });
  }

  if (!upstream.ok) {
    return new NextResponse(null, {
      status: upstream.status,
      headers: {
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }

  const buffer = await upstream.arrayBuffer();
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      ...common,
      'Content-Type': upstream.headers.get('content-type') ?? 'image/png',
    },
  });
}
