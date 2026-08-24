import Link from 'next/link';
import type { PublicArtwork } from '@/types';
import { formatPublicPrice, primaryMedia } from '@/lib/public-gallery';
import { GalleryImage } from './GalleryImage';

export function GalleryGrid({
  artworks,
  featured = false,
}: {
  artworks: PublicArtwork[];
  featured?: boolean;
}) {
  return (
    <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
      {artworks.map((artwork, index) => {
        const media = primaryMedia(artwork);
        return (
          <li key={artwork.id} className="flex flex-col">
            <Link href={`/gallery/${artwork.slug}`} className="group block">
              <figure className="overflow-hidden bg-ink/[0.03]">
                {media ? (
                  <GalleryImage
                    media={media}
                    priority={featured && index < 3}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex aspect-[4/5] items-center justify-center text-sm text-muted">
                    Image forthcoming
                  </div>
                )}
              </figure>
              <h2 className="mt-3 font-display text-xl tracking-tight">{artwork.title}</h2>
              <p className="mt-1 text-sm text-muted">
                {[artwork.collection, artwork.category?.name, artwork.year]
                  .filter(Boolean)
                  .join(' · ') || 'Artwork'}
                {artwork.status === 'SOLD' ? ' · Sold' : ''}
              </p>
            </Link>
            <p className="mt-1 text-sm text-muted">{formatPublicPrice(artwork.price)}</p>
            <Link
              href={`/contact?work=${encodeURIComponent(artwork.slug)}`}
              className="mt-3 inline-flex min-h-11 w-fit items-center text-sm tracking-wide text-ink/70 underline-offset-4 hover:text-ink hover:underline"
            >
              Enquire
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
