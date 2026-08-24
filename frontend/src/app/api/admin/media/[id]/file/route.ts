import { proxyAdminBinary } from '@/lib/admin-bff';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  return proxyAdminBinary(`/admin/media/${params.id}/file`);
}
