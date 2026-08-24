import { proxyAdmin } from '@/lib/admin-bff';

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string; mediaId: string } },
) {
  return proxyAdmin(`/admin/artworks/${params.id}/media/${params.mediaId}`, {
    method: 'DELETE',
  });
}
