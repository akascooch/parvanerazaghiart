import { proxyAdmin } from '@/lib/admin-bff';

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  return proxyAdmin(`/admin/artworks/${params.id}/restore`, { method: 'POST' });
}
