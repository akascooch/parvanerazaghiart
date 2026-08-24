import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from '@/components/admin/LoginForm';

export const metadata: Metadata = {
  title: 'Admin login',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#111] px-6 text-[#f5f0e8]">
      <div className="w-full max-w-md">
        <p className="text-xs tracking-[0.35em] uppercase opacity-60">Admin</p>
        <h1 className="mt-3 font-display text-3xl">Sign in</h1>
        <p className="mt-2 text-sm opacity-70">
          Restricted access for gallery administration.
        </p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
