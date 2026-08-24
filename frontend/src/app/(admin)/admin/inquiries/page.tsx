import Link from 'next/link';
import { InquiryStatusForm } from '@/components/admin/InquiryStatusForm';
import { AdminApiError, adminBackend } from '@/lib/admin-backend';

type InquiryRow = {
  id: string;
  name: string;
  contact: string;
  message: string;
  artworkSlug: string | null;
  status: 'NEW' | 'READ' | 'CLOSED';
  createdAt: string;
  artwork: { id: string; title: string; slug: string; status: string } | null;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default async function AdminInquiriesPage() {
  let rows: InquiryRow[] = [];
  let error: string | null = null;
  try {
    rows = await adminBackend<InquiryRow[]>('/admin/inquiries');
  } catch (caught) {
    error =
      caught instanceof AdminApiError
        ? caught.message
        : 'Could not load enquiries';
  }

  return (
    <main className="px-4 py-8 sm:px-6 sm:py-10">
      <p className="text-xs uppercase tracking-[0.3em] text-white/45">Studio</p>
      <h1 className="mt-2 font-display text-3xl">Enquiries</h1>
      <p className="mt-2 max-w-2xl text-sm text-white/55">
        Private collector messages. Hidden artwork prices are never stored on
        these rows.
      </p>

      {error ? (
        <p className="mt-8 border border-red-400/20 px-4 py-6 text-sm text-red-200/90">
          {error}
        </p>
      ) : rows.length === 0 ? (
        <section className="mt-8 border border-dashed border-white/15 px-6 py-16 text-center">
          <p className="font-display text-2xl">No enquiries yet</p>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/55">
            Public gallery and contact forms will appear here.
          </p>
        </section>
      ) : (
        <div className="mt-8 overflow-x-auto border border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-[0.16em] text-white/45">
              <tr>
                <th className="px-4 py-3 font-normal">Received</th>
                <th className="px-4 py-3 font-normal">Name</th>
                <th className="px-4 py-3 font-normal">Contact</th>
                <th className="px-4 py-3 font-normal">Artwork</th>
                <th className="px-4 py-3 font-normal">Message</th>
                <th className="px-4 py-3 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-white/5 align-top last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 text-white/55">
                    {formatDate(row.createdAt)}
                  </td>
                  <td className="px-4 py-3">{row.name}</td>
                  <td className="px-4 py-3 text-white/80">{row.contact}</td>
                  <td className="px-4 py-3 text-white/70">
                    {row.artwork ? (
                      <Link
                        href={`/admin/artworks/${row.artwork.id}`}
                        className="hover:text-white"
                      >
                        {row.artwork.title}
                      </Link>
                    ) : (
                      row.artworkSlug || '—'
                    )}
                  </td>
                  <td className="max-w-sm px-4 py-3 text-white/70">
                    {row.message}
                  </td>
                  <td className="px-4 py-3">
                    <InquiryStatusForm id={row.id} status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-white/10 px-4 py-3 text-xs text-white/40">
            {rows.length} enquir{rows.length === 1 ? 'y' : 'ies'}
          </p>
        </div>
      )}
    </main>
  );
}
