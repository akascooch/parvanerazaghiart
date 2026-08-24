import { proxyAdmin } from '@/lib/admin-bff';

export async function PATCH(
  _request: Request,
  { params }: { params: { id: string; mediaId: string } },
) {
  return proxyAdmin(
    `/admin/artworks/${params.id}/media/${params.mediaId}/primary`,
    { method: 'PATCH' },
  );
}
