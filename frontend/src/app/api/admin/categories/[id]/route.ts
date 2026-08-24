import { NextResponse } from 'next/server';
import { proxyAdmin } from '@/lib/admin-bff';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  return proxyAdmin(`/admin/categories/${params.id}`);
}

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

  return proxyAdmin(`/admin/categories/${params.id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  return proxyAdmin(`/admin/categories/${params.id}`, { method: 'DELETE' });
}
