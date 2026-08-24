import Link from 'next/link';
import { AdminApiError, adminBackend } from '@/lib/admin-backend';
import { getAdminSession } from '@/lib/admin-session';
import type { ArtworkSummary } from '@/types';

export default async function AdminDashboardPage() {
  const user = await getAdminSession();
  const greeting = user?.name || user?.email || 'Administrator';

  let summary: ArtworkSummary | null = null;
  let inquiries: { status: string }[] = [];
  try {
    summary = await adminBackend<ArtworkSummary>('/admin/artworks/summary');
    inquiries = await adminBackend<{ status: string }[]>('/admin/inquiries');
  } catch (error) {
    if (!(error instanceof AdminApiError)) {
      throw error;
    }
  }

  const newEnquiries = inquiries.filter((item) => item.status === 'NEW').length;
  const cards = [
    { label: 'Artworks', value: summary?.total, href: '/admin/artworks' },
    { label: 'Published', value: summary?.published, href: '/admin/artworks?status=PUBLISHED' },
    { label: 'New enquiries', value: summary ? newEnquiries : undefined, href: '/admin/inquiries' },
  ];

  return (
    <main className="px-4 py-8 sm:px-6 sm:py-10">
      <section className="border border-white/10 bg-white/[0.03] px-5 py-7 sm:px-6 sm:py-8">
        <p className="text-xs tracking-[0.3em] uppercase text-white/45">Studio</p>
        <h1 className="mt-3 font-display text-3xl">Welcome back, {greeting}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/65">
          Manage catalog records and attach private artwork images from this
          workspace. Public gallery polish stays in a later phase.
        </p>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="border border-white/10 px-5 py-6 transition-colors hover:border-white/25"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-white/45">
              {card.label}
            </p>
            <p className="mt-3 font-display text-3xl">
              {card.value === undefined ? '—' : card.value}
            </p>
            <p className="mt-2 text-xs text-white/40">Open collection</p>
          </Link>
        ))}
      </section>

      <section className="mt-8">
        <h2 className="text-sm uppercase tracking-[0.2em] text-white/45">
          Quick actions
        </h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/admin/artworks/new"
            className="border border-white/25 px-4 py-2 text-sm text-white/80 hover:border-white/50"
          >
            Add artwork
          </Link>
          <Link
            href="/admin/categories"
            className="border border-white/25 px-4 py-2 text-sm text-white/80 hover:border-white/50"
          >
            Categories
          </Link>
          <Link
            href="/admin/artworks"
            className="border border-white/25 px-4 py-2 text-sm text-white/80 hover:border-white/50"
          >
            Manage media
          </Link>
          <Link
            href="/admin/inquiries"
            className="border border-white/25 px-4 py-2 text-sm text-white/80 hover:border-white/50"
          >
            Enquiries
          </Link>
          <Link
            href="/"
            className="border border-white/25 px-4 py-2 text-sm text-white/80 hover:border-white/50"
          >
            View public gallery
          </Link>
        </div>
      </section>
    </main>
  );
}
