import type { Metadata } from 'next';
import Link from 'next/link';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { fetchPublicGallery } from '@/lib/public-gallery';
import { defaultOgImage, siteName, siteUrl } from '@/lib/site';

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
      images: [defaultOgImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Gallery',
      description,
      images: [defaultOgImage.url],
    },
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
  const fieldClass =
    'min-h-11 w-full border border-noir/10 bg-transparent px-3 py-2 font-sans text-sm text-noir outline-none transition-colors duration-300 hover:border-noir focus:border-noir';

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <header className="max-w-2xl">
        <p className="font-sans text-xs uppercase tracking-luxury text-muted">
          Catalog Raisonné / Works
        </p>
        <h1 className="mt-4 font-serif text-4xl font-normal text-noir md:text-5xl">
          The Permanent Collection
        </h1>
        <span className="mt-6 block h-px w-16 bg-gold" aria-hidden="true" />
        <p className="mt-6 max-w-xl text-muted">
          Works currently on view. Images load as responsive, lazy-loaded
          derivatives — originals remain private.
        </p>
      </header>

      {gallery.facets.techniques.length > 0 ? (
        <ul className="mt-10 flex flex-wrap gap-2" aria-label="Technique">
          <li>
            <Link
              href={hrefFor({ q, category, collection })}
              className={`inline-flex min-h-11 items-center px-4 py-2 font-sans text-[10px] uppercase tracking-luxury ${
                technique
                  ? 'border border-noir/10 text-noir/70 hover:border-noir'
                  : 'bg-noir text-paper'
              }`}
            >
              All media
            </Link>
          </li>
          {gallery.facets.techniques.map((item) => {
            const active = technique === item;
            return (
              <li key={item}>
                <Link
                  href={hrefFor({
                    q,
                    category,
                    collection,
                    technique: active ? undefined : item,
                  })}
                  className={`inline-flex min-h-11 items-center px-4 py-2 font-sans text-[10px] uppercase tracking-luxury ${
                    active
                      ? 'bg-noir text-paper'
                      : 'border border-noir/10 text-noir/70 hover:border-noir'
                  }`}
                >
                  {item}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}

      <form method="get" action="/gallery" className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {technique ? <input type="hidden" name="technique" value={technique} /> : null}
        <label className="text-sm lg:col-span-2">
          <span className="mb-1 block font-sans text-[10px] uppercase tracking-luxury text-muted">
            Search title
          </span>
          <input name="q" defaultValue={q ?? ''} className={fieldClass} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-sans text-[10px] uppercase tracking-luxury text-muted">
            Category
          </span>
          <select name="category" defaultValue={category ?? ''} className={fieldClass}>
            <option value="">All</option>
            {gallery.facets.categories.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-sans text-[10px] uppercase tracking-luxury text-muted">
            Collection
          </span>
          <select name="collection" defaultValue={collection ?? ''} className={fieldClass}>
            <option value="">All</option>
            {gallery.facets.collections.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end gap-3 sm:col-span-2 lg:col-span-1">
          <button
            type="submit"
            className="min-h-11 bg-noir px-4 py-2 font-sans text-[10px] uppercase tracking-luxury text-paper transition-colors duration-300 hover:bg-gold"
          >
            Apply filters
          </button>
          {filtered ? (
            <Link
              href="/gallery"
              className="inline-flex min-h-11 items-center font-sans text-[10px] uppercase tracking-luxury text-muted hover:text-gold"
            >
              Reset
            </Link>
          ) : null}
        </div>
      </form>

      <div className="mt-14">
        {gallery.items.length === 0 ? (
          <section className="border border-dashed border-noir/15 px-6 py-16 text-center">
            <p className="font-serif text-2xl text-noir">
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
            <Link
              href={hrefFor(searchParams, page - 1)}
              className="inline-flex min-h-11 items-center border border-noir/10 px-3 py-2 font-sans text-xs uppercase tracking-luxury hover:border-noir"
            >
              Previous
            </Link>
          ) : (
            <span className="px-3 py-1 text-muted">Previous</span>
          )}
          <span className="font-sans text-xs uppercase tracking-luxury text-muted">
            Page {page} of {pages}
          </span>
          {page < pages ? (
            <Link
              href={hrefFor(searchParams, page + 1)}
              className="inline-flex min-h-11 items-center border border-noir/10 px-3 py-2 font-sans text-xs uppercase tracking-luxury hover:border-noir"
            >
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
