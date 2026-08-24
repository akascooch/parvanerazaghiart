import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArtworkLightbox } from '@/components/gallery/ArtworkLightbox';
import { InquiryForm } from '@/components/public/InquiryForm';
import { fetchPublicArtwork, formatPublicPrice } from '@/lib/public-gallery';
import { absoluteUrl, ogImages, serializeJsonLd, siteName, siteUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const artwork = await fetchPublicArtwork(params.slug);
  if (!artwork) {
    return { title: 'Artwork', robots: { index: false, follow: false } };
  }
  const image = artwork.media.find((item) => item.isPrimary) ?? artwork.media[0];
  const description =
    artwork.description ??
    [artwork.title, artwork.technique, artwork.collection, artwork.category?.name, artwork.year]
      .filter(Boolean)
      .join(' · ');
  const canonical = `/gallery/${artwork.slug}`;
  const images = ogImages(
    image
      ? { url: image.src.preview, alt: image.alt, width: image.width ?? undefined }
      : undefined,
  );
  return {
    title: artwork.title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${artwork.title} — ${siteName}`,
      description,
      url: siteUrl(canonical),
      type: 'article',
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: artwork.title,
      description,
      images: images.map((item) => item.url),
    },
  };
}

export default async function ArtworkDetailPage({ params }: Props) {
  const artwork = await fetchPublicArtwork(params.slug);
  if (!artwork) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VisualArtwork',
    name: artwork.title,
    url: siteUrl(`/gallery/${artwork.slug}`),
    description: artwork.description,
    artMedium: artwork.technique ?? artwork.medium,
    dateCreated: artwork.year ? String(artwork.year) : undefined,
    creator: {
      '@type': 'Person',
      name: 'Parvane Razaghi',
    },
    image: artwork.media.map((item) => absoluteUrl(item.src.full)),
    ...(artwork.price
      ? { offers: { '@type': 'Offer', price: artwork.price } }
      : {}),
  };

  const meta = [
    ['Collection', artwork.collection],
    ['Category', artwork.category?.name],
    ['Technique', artwork.technique],
    ['Dimensions', artwork.dimensions],
    ['Year', artwork.year ? String(artwork.year) : null],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <article>
        <header className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.3em] text-muted">Artwork</p>
          <h1 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">
            {artwork.title}
          </h1>
          <dl className="mt-6 grid gap-2 text-sm text-muted">
            {meta.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[7.5rem_1fr] gap-3 sm:grid-cols-[8rem_1fr]">
                <dt>{label}</dt>
                <dd className="text-ink/80">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-sm">
            {artwork.status === 'SOLD' ? 'Sold · ' : ''}
            {artwork.price ? formatPublicPrice(artwork.price) : 'Price on request'}
          </p>
          <p className="mt-5">
            <a
              href="#enquire"
              className="inline-flex min-h-11 items-center border border-ink/20 px-4 py-2 text-sm hover:border-ink/50"
            >
              Enquire about this work
            </a>
          </p>
        </header>

        {artwork.description ? (
          <p className="mt-8 max-w-2xl text-[1.05rem] leading-relaxed text-ink/80">
            {artwork.description}
          </p>
        ) : null}

        <ArtworkLightbox title={artwork.title} media={artwork.media} />

        <section id="enquire" className="mt-16 max-w-2xl border-t border-ink/10 pt-10">
          <h2 className="font-display text-2xl">Private enquiry</h2>
          <p className="mt-2 text-sm text-muted">
            Ask about availability or a quote. Hidden prices are never shown here.
          </p>
          <div className="mt-6">
            <InquiryForm artworkSlug={artwork.slug} artworkTitle={artwork.title} />
          </div>
        </section>
      </article>
    </main>
  );
}
