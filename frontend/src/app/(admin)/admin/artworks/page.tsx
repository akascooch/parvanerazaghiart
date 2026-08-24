import Link from 'next/link';
import { ArtworkFilters } from '@/components/admin/ArtworkFilters';
import { RestoreButton } from '@/components/admin/RestoreButton';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { AdminApiError, adminBackend } from '@/lib/admin-backend';
import type { ArtworkListResponse, ArtworkStatus } from '@/types';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
  }).format(new Date(value));
}

export default async function AdminArtworksPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string; deleted?: string };
}) {
  const status = searchParams.status as ArtworkStatus | undefined;
  const q = searchParams.q?.trim();
  const deleted = searchParams.deleted === '1' || searchParams.deleted === 'true';
  const params = new URLSearchParams();
  if (status && !deleted) {
    params.set('status', status);
  }
  if (q) {
    params.set('q', q);
  }
  if (deleted) {
    params.set('deleted', 'true');
  }

  let list: ArtworkListResponse | null = null;
  let error: string | null = null;
  try {
    list = await adminBackend<ArtworkListResponse>(
      `/admin/artworks${params.size ? `?${params.toString()}` : ''}`,
    );
  } catch (caught) {
    error =
      caught instanceof AdminApiError
        ? caught.message
        : 'Could not load the collection';
  }

  const rows = list?.items ?? [];

  return (
    <main className="px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/45">
            Catalog
          </p>
          <h1 className="mt-2 font-display text-3xl">Collection</h1>
          <p className="mt-2 text-sm text-white/55">
            {deleted ? 'Soft-deleted records' : 'Sorted by newest first'}
          </p>
        </div>
        <Link
          href="/admin/artworks/new"
          className="border border-white/25 px-4 py-2 text-sm text-white/80 hover:border-white/50"
        >
          Add artwork
        </Link>
      </div>

      <div className="mt-8">
        <ArtworkFilters status={status} q={q} deleted={deleted} />
      </div>

      {error ? (
        <p className="mt-8 border border-red-400/20 px-4 py-6 text-sm text-red-200/90">
          {error}
        </p>
      ) : rows.length === 0 ? (
        <section className="mt-8 border border-dashed border-white/15 px-6 py-16 text-center">
          <p className="font-display text-2xl">
            {deleted
              ? 'No deleted artworks'
              : status || q
                ? 'No matching artworks'
                : 'No artworks yet'}
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/55">
            {deleted
              ? 'Soft-deleted catalog records will appear here for restore.'
              : status || q
                ? 'Try a different filter or search, or create a new catalog record.'
                : 'Create a catalog record, then attach images from the artwork page.'}
          </p>
        </section>
      ) : (
        <div className="mt-8 overflow-x-auto border border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-[0.16em] text-white/45">
              <tr>
                <th className="px-4 py-3 font-normal">Title</th>
                <th className="px-4 py-3 font-normal">Category</th>
                <th className="px-4 py-3 font-normal">Slug</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 font-normal">Year</th>
                <th className="px-4 py-3 font-normal">Updated</th>
                {deleted ? <th className="px-4 py-3 font-normal">Restore</th> : null}
              </tr>
            </thead>
            <tbody>
              {rows.map((artwork) => (
                <tr key={artwork.id} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3">
                    {deleted ? (
                      artwork.title
                    ) : (
                      <Link
                        href={`/admin/artworks/${artwork.id}`}
                        className="hover:text-white"
                      >
                        {artwork.title}
                      </Link>
                    )}
                  </td>
                  <td className="px-4 py-3 text-white/55">
                    {artwork.category?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-white/55">{artwork.slug}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={artwork.status} />
                  </td>
                  <td className="px-4 py-3 text-white/55">{artwork.year ?? '—'}</td>
                  <td className="px-4 py-3 text-white/55">
                    {formatDate(artwork.updatedAt)}
                  </td>
                  {deleted ? (
                    <td className="px-4 py-3">
                      <RestoreButton id={artwork.id} title={artwork.title} />
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-white/10 px-4 py-3 text-xs text-white/40">
            {list?.total ?? 0} record{(list?.total ?? 0) === 1 ? '' : 's'}
          </p>
        </div>
      )}
    </main>
  );
}
