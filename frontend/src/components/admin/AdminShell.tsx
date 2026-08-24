import type { AuthUser } from '@/types';
import { AdminNav } from '@/components/admin/AdminNav';
import { LogoutButton } from '@/components/admin/LogoutButton';

export function AdminShell({
  user,
  children,
}: {
  user: AuthUser;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#111] text-[#f5f0e8]">
      <header className="border-b border-white/10">
        <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[11px] tracking-[0.3em] uppercase text-white/45">
              Parvane Razaghi Art
            </p>
            <p className="mt-1 text-sm text-white/80">Administration</p>
          </div>
          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            <div className="hidden text-right text-sm sm:block">
              <p className="truncate">{user.name || user.email}</p>
              <p className="text-[11px] uppercase tracking-wider text-white/45">
                {user.role}
              </p>
            </div>
            <LogoutButton />
          </div>
        </div>
        <div className="border-t border-white/10 px-2 py-1 md:hidden">
          <AdminNav orientation="horizontal" />
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-73px)]">
        <aside className="hidden w-56 shrink-0 border-r border-white/10 px-3 py-6 md:block">
          <AdminNav />
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
