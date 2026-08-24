import { NextResponse } from 'next/server';
import { proxyAdmin } from '@/lib/admin-bff';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  return proxyAdmin(`/admin/artworks/${params.id}/media/reorder`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}
