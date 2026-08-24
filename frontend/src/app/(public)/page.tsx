import type { Metadata } from 'next';
import Link from 'next/link';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { fetchPublicArtworks } from '@/lib/public-gallery';
import { defaultDescription, ogImages, siteName, siteUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const featured = (await fetchPublicArtworks()).slice(0, 1)[0];
  const image = featured?.media.find((item) => item.isPrimary) ?? featured?.media[0];
  const images = ogImages(
    image
      ? { url: image.src.preview, alt: image.alt ?? featured?.title }
      : undefined,
  );
  return {
    title: { absolute: siteName },
    description: defaultDescription,
    alternates: { canonical: '/' },
    openGraph: {
      title: siteName,
      description: defaultDescription,
      url: siteUrl('/'),
      type: 'website',
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: siteName,
      description: defaultDescription,
      images: images.map((item) => item.url),
    },
  };
}

export default async function HomePage() {
  const artworks = (await fetchPublicArtworks()).slice(0, 3);

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
      <section className="flex min-h-[70vh] flex-col items-center justify-center px-2 text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-muted">Gallery</p>
        <h1 className="mt-4 font-display text-4xl tracking-tight md:text-6xl">
          Parvane Razaghi Art
        </h1>
        <p className="mt-5 max-w-md text-muted">
          A considered collection of paintings, presented with the stillness they
          were made in.
        </p>
        <Link
          href="/gallery"
          className="mt-10 border border-ink/20 px-6 py-3 text-sm tracking-wide hover:border-ink/50"
        >
          View the collection
        </Link>
      </section>

      {artworks.length > 0 ? (
        <section aria-labelledby="featured-heading">
          <h2 id="featured-heading" className="font-display text-2xl">
            Selected works
          </h2>
          <div className="mt-8">
            <GalleryGrid artworks={artworks} featured />
          </div>
        </section>
      ) : null}
    </main>
  );
}
