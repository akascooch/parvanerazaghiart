import type { Metadata } from 'next';
import Link from 'next/link';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { GalleryImage } from '@/components/gallery/GalleryImage';
import { ArtistTeaser } from '@/components/public/ArtistTeaser';
import { fetchPublicArtworks, primaryMedia } from '@/lib/public-gallery';
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
  const featured = artworks[0];
  const hero = featured ? primaryMedia(featured) : undefined;

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
      <section className="flex flex-col items-center px-2 pt-16 text-center sm:pt-20">
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
        {featured && hero ? (
          <Link
            href={`/gallery/${featured.slug}`}
            className="mt-14 block w-full max-w-3xl"
          >
            <figure className="overflow-hidden bg-ink/[0.03]">
              <GalleryImage
                media={hero}
                priority
                sizes="(max-width: 768px) 100vw, 768px"
                className="aspect-[4/5] w-full object-cover sm:aspect-[5/4]"
              />
              <figcaption className="mt-3 text-left text-sm text-muted">
                {featured.title}
                {featured.year ? ` · ${featured.year}` : ''}
              </figcaption>
            </figure>
          </Link>
        ) : null}
      </section>

      <ArtistTeaser />

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
