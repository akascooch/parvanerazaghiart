import type { Metadata } from 'next';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { ArtistTeaser } from '@/components/public/ArtistTeaser';
import { FadeIn } from '@/components/public/FadeIn';
import { HeroCinematic } from '@/components/public/HeroCinematic';
import { artist } from '@/data/artist-data';
import { fetchPublicArtworks } from '@/lib/public-gallery';
import { defaultDescription, ogImages, siteName, siteUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const featured = (await fetchPublicArtworks({ limit: 1 }))[0];
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
  const artworks = (await fetchPublicArtworks({ limit: 6 })).slice(0, 6);

  return (
    <main className="pb-24">
      <HeroCinematic />

      <FadeIn>
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <p className="font-sans text-[11px] uppercase tracking-luxury text-muted">
            [ 00 — Philosophy ]
          </p>
          <blockquote className="mt-6 max-w-3xl font-serif text-2xl font-light italic leading-relaxed text-noir md:text-4xl md:leading-snug">
            “{artist.statement}”
          </blockquote>
        </section>
      </FadeIn>

      {artworks.length > 0 ? (
        <section
          id="curated-works"
          aria-labelledby="featured-heading"
          className="mx-auto max-w-6xl scroll-mt-28 px-4 py-24 sm:px-6"
        >
          <FadeIn>
            <p className="font-sans text-[11px] uppercase tracking-luxury text-muted">
              [ 01 — Selected works ]
            </p>
            <h2
              id="featured-heading"
              className="mt-4 font-serif text-4xl font-normal tracking-tight text-noir md:text-5xl"
            >
              Curated Selection
            </h2>
          </FadeIn>
          <div className="mt-12">
            <GalleryGrid artworks={artworks} featured />
          </div>
        </section>
      ) : null}

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ArtistTeaser />
      </div>
    </main>
  );
}
