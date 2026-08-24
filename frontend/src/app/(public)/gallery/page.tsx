import type { Metadata } from 'next';
import Link from 'next/link';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { fetchPublicGallery } from '@/lib/public-gallery';
import { siteName, siteUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Search;
}): Promise<Metadata> {
  const filtered = Boolean(
    searchParams.q || searchParams.category || searchParams.collection || searchParams.technique,
  );
  const canonical = hrefFor(searchParams);
  const description = filtered
    ? 'Filtered view of published works by Parvane Razaghi.'
    : 'Browse published artworks by Parvane Razaghi. Filter by category, collection, and technique.';
  return {
    title: filtered ? 'Gallery results' : 'Gallery',
    description,
    alternates: { canonical },
    openGraph: {
      title: `Gallery — ${siteName}`,
      description,
      url: siteUrl(canonical),
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title: 'Gallery', description },
  };
}

type Search = {
  q?: string;
  category?: string;
  collection?: string;
  technique?: string;
  page?: string;
};

function hrefFor(search: Search, page?: number) {
  const params = new URLSearchParams();
  if (search.q) params.set('q', search.q);
  if (search.category) params.set('category', search.category);
  if (search.collection) params.set('collection', search.collection);
  if (search.technique) params.set('technique', search.technique);
  if (page && page > 1) params.set('page', String(page));
  const query = params.toString();
  return query ? `/gallery?${query}` : '/gallery';
}

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const page = Math.max(1, Number(searchParams.page || 1) || 1);
  const q = searchParams.q?.trim() || undefined;
  const category = searchParams.category?.trim() || undefined;
  const collection = searchParams.collection?.trim() || undefined;
  const technique = searchParams.technique?.trim() || undefined;
  const gallery = await fetchPublicGallery({
    q,
    category,
    collection,
    technique,
    page,
    limit: 12,
  });
  const pages = Math.max(1, Math.ceil(gallery.total / gallery.limit));
  const filtered = Boolean(q || category || collection || technique);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <header className="max-w-2xl">
        <p className="text-sm uppercase tracking-[0.3em] text-muted">Collection</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight">Gallery</h1>
        <p className="mt-3 text-muted">
          Works currently on view. Images load as responsive, lazy-loaded
          derivatives — originals remain private.
        </p>
      </header>

      <form method="get" action="/gallery" className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <label className="text-sm lg:col-span-2">
          <span className="mb-1 block text-xs uppercase tracking-[0.16em] text-muted">
            Search title
          </span>
          <input
            name="q"
            defaultValue={q ?? ''}
            className="min-h-11 w-full border border-ink/15 bg-transparent px-3 py-2 outline-none focus:border-ink/40"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs uppercase tracking-[0.16em] text-muted">
            Category
          </span>
          <select
            name="category"
            defaultValue={category ?? ''}
            className="min-h-11 w-full border border-ink/15 bg-transparent px-3 py-2"
          >
            <option value="">All</option>
            {gallery.facets.categories.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs uppercase tracking-[0.16em] text-muted">
            Collection
          </span>
          <select
            name="collection"
            defaultValue={collection ?? ''}
            className="min-h-11 w-full border border-ink/15 bg-transparent px-3 py-2"
          >
            <option value="">All</option>
            {gallery.facets.collections.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs uppercase tracking-[0.16em] text-muted">
            Technique
          </span>
          <select
            name="technique"
            defaultValue={technique ?? ''}
            className="min-h-11 w-full border border-ink/15 bg-transparent px-3 py-2"
          >
            <option value="">All</option>
            {gallery.facets.techniques.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end gap-3 lg:col-span-5">
          <button type="submit" className="min-h-11 border border-ink/20 px-4 py-2 text-sm hover:border-ink/50">
            Apply filters
          </button>
          {filtered ? (
            <Link href="/gallery" className="py-2 text-sm text-muted hover:text-ink">
              Reset
            </Link>
          ) : null}
        </div>
      </form>

      <div className="mt-12">
        {gallery.items.length === 0 ? (
          <section className="border border-dashed border-ink/15 px-6 py-16 text-center">
            <p className="font-display text-2xl">
              {filtered ? 'No works match these filters' : 'The collection is not on view yet'}
            </p>
            <p className="mx-auto mt-3 max-w-md text-muted">
              {filtered
                ? 'Try another category, collection, technique, or title.'
                : 'Published works will appear here.'}
            </p>
          </section>
        ) : (
          <GalleryGrid artworks={gallery.items} />
        )}
      </div>

      {pages > 1 ? (
        <nav aria-label="Gallery pages" className="mt-12 flex items-center justify-center gap-4 text-sm">
          {page > 1 ? (
            <Link href={hrefFor(searchParams, page - 1)} className="min-h-11 border border-ink/20 px-3 py-2">
              Previous
            </Link>
          ) : (
            <span className="px-3 py-1 text-muted">Previous</span>
          )}
          <span className="text-muted">
            Page {page} of {pages}
          </span>
          {page < pages ? (
            <Link href={hrefFor(searchParams, page + 1)} className="min-h-11 border border-ink/20 px-3 py-2">
              Next
            </Link>
          ) : (
            <span className="px-3 py-1 text-muted">Next</span>
          )}
        </nav>
      ) : null}
    </main>
  );
}
