import { proxyAdmin } from '@/lib/admin-bff';

export async function GET() {
  return proxyAdmin('/admin/inquiries');
}
