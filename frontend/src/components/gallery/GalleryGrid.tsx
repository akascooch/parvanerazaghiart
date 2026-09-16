import type { PublicArtwork } from '@/types';
import { ArtworkCard } from '@/components/public/ArtworkCard';

export function GalleryGrid({
  artworks,
  featured = false,
}: {
  artworks: PublicArtwork[];
  featured?: boolean;
}) {
  return (
    <ul className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-16">
      {artworks.map((artwork, index) => (
        <ArtworkCard
          key={artwork.id}
          artwork={artwork}
          priority={featured && index < 3}
        />
      ))}
    </ul>
  );
}
