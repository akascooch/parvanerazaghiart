import { ChangePasswordForm } from '@/components/admin/ChangePasswordForm';

export default function AdminSettingsPage() {
  return (
    <main className="px-4 py-8 sm:px-6 sm:py-10">
      <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">Account</p>
      <h1 className="mt-2 font-serif text-3xl text-[#f5f0e8]">Settings</h1>
      <p className="mt-2 max-w-xl text-sm text-white/55">
        Manage the administration credentials for this gallery.
      </p>
      <div className="mt-8">
        <ChangePasswordForm />
      </div>
    </main>
  );
}
