import { AdminShell } from '@/components/admin/AdminShell';
import { requireAdminSession } from '@/lib/admin-session';

export const dynamic = 'force-dynamic';

export default async function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdminSession();
  return <AdminShell user={user}>{children}</AdminShell>;
}
