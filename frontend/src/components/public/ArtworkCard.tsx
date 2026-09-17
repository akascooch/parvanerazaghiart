import Link from 'next/link';
import type { PublicArtwork } from '@/types';
import { formatPublicPrice, primaryMedia } from '@/lib/public-gallery';
import { GalleryImage, mediaAspectStyle } from '@/components/gallery/GalleryImage';

function availabilityLabel(status: PublicArtwork['status']): string {
  return status === 'SOLD' ? '[ Private Collection ]' : '[ Available ]';
}

export function ArtworkCard({
  artwork,
  priority = false,
}: {
  artwork: PublicArtwork;
  priority?: boolean;
}) {
  const media = primaryMedia(artwork);
  const mediumLine = [artwork.technique ?? artwork.medium, artwork.dimensions]
    .filter(Boolean)
    .join('  ·  ');

  return (
    <li className="flex flex-col">
      <Link href={`/gallery/${artwork.slug}`} className="group block">
        <figure className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden border border-noir/5 bg-parchment p-4 transition-all duration-500 sm:p-5 group-hover:border-gold/30 group-hover:shadow-lg">
          {media ? (
            <GalleryImage
              media={media}
              priority={priority}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="h-auto w-auto max-h-full max-w-full min-h-0 min-w-0 object-contain drop-shadow-md transition-transform duration-500 ease-out"
              style={mediaAspectStyle(media.width, media.height)}
            />
          ) : (
            <div className="font-sans text-xs uppercase tracking-luxury text-muted">
              Image forthcoming
            </div>
          )}
        </figure>
        <h2 className="mt-4 font-serif text-lg font-normal text-noir transition-colors duration-300 group-hover:text-gold md:text-xl">
          {artwork.title}
        </h2>
        {mediumLine ? (
          <p className="mt-1 font-sans text-[11px] uppercase tracking-wider text-muted">{mediumLine}</p>
        ) : null}
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-[10px] uppercase tracking-luxury text-muted">
          {artwork.year ? <span>{artwork.year}</span> : null}
          <span>{availabilityLabel(artwork.status)}</span>
        </p>
      </Link>
      <p className="mt-2 font-sans text-[11px] uppercase tracking-wider text-muted">
        {formatPublicPrice(artwork.price)}
      </p>
      <Link
        href={`/contact?work=${encodeURIComponent(artwork.slug)}`}
        className="mt-3 inline-flex min-h-11 w-fit items-center font-sans text-xs uppercase tracking-luxury text-noir/70 underline-offset-8 hover:text-gold hover:underline"
      >
        Enquire
      </Link>
    </li>
  );
}
