import { proxyAdmin, proxyAdminForm } from '@/lib/admin-bff';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  return proxyAdmin(`/admin/artworks/${params.id}/media`);
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  return proxyAdminForm(`/admin/artworks/${params.id}/media`, request);
}
