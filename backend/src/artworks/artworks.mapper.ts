import { Artwork, ArtworkStatus, Category, Media, Prisma } from '@prisma/client';
import { publicMediaPath } from '../media/media-signing';
import { toAdminMedia, type AdminMediaView } from '../media/media.mapper';

export type AdminCategoryView = {
  id: string;
  name: string;
  slug: string;
};

export type AdminArtworkView = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: string | null;
  isPriceVisible: boolean;
  status: ArtworkStatus;
  medium: string | null;
  technique: string | null;
  dimensions: string | null;
  collection: string | null;
  year: number | null;
  categoryId: string | null;
  category: AdminCategoryView | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  media: AdminMediaView[];
};

export type PublicMediaView = {
  id: string;
  alt: string;
  width: number | null;
  height: number | null;
  isPrimary: boolean;
  sortOrder: number;
  src: {
    thumb: string;
    preview: string;
    full: string;
  };
};

export type PublicArtworkView = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: string | null;
  status: ArtworkStatus;
  medium: string | null;
  technique: string | null;
  dimensions: string | null;
  collection: string | null;
  year: number | null;
  category: AdminCategoryView | null;
  createdAt: Date;
  media: PublicMediaView[];
};

export function toAdminArtwork(
  artwork: Artwork & { media?: Media[]; category?: Category | null },
): AdminArtworkView {
  return {
    id: artwork.id,
    title: artwork.title,
    slug: artwork.slug,
    description: artwork.description,
    price: artwork.price === null ? null : artwork.price.toString(),
    isPriceVisible: artwork.isPriceVisible,
    status: artwork.status,
    medium: artwork.medium,
    technique: artwork.technique,
    dimensions: artwork.dimensions,
    collection: artwork.collection,
    year: artwork.year,
    categoryId: artwork.categoryId,
    category: artwork.category
      ? {
          id: artwork.category.id,
          name: artwork.category.name,
          slug: artwork.category.slug,
        }
      : null,
    deletedAt: artwork.deletedAt,
    createdAt: artwork.createdAt,
    updatedAt: artwork.updatedAt,
    media: (artwork.media ?? []).map(toAdminMedia),
  };
}

export function publicMediaAlt(
  artwork: Pick<Artwork, 'title' | 'technique' | 'year' | 'collection'> & {
    category?: Pick<Category, 'name'> | null;
  },
  item: Pick<Media, 'alt'>,
): string {
  const custom = item.alt?.trim();
  if (custom) {
    return custom;
  }
  return [
    artwork.title,
    artwork.technique,
    artwork.collection,
    artwork.category?.name,
    artwork.year,
  ]
    .filter((part) => part !== null && part !== undefined && String(part).trim() !== '')
    .join(', ');
}

export function toDecimal(value?: number | null): Prisma.Decimal | null | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return new Prisma.Decimal(value);
}

export function toPublicArtwork(
  artwork: Artwork & { media?: Media[]; category?: Category | null },
  signingSecret: string,
): PublicArtworkView {
  return {
    id: artwork.id,
    title: artwork.title,
    slug: artwork.slug,
    description: artwork.description,
    price:
      artwork.isPriceVisible && artwork.price !== null
        ? artwork.price.toString()
        : null,
    status: artwork.status,
    medium: artwork.medium,
    technique: artwork.technique,
    dimensions: artwork.dimensions,
    collection: artwork.collection,
    year: artwork.year,
    category: artwork.category
      ? {
          id: artwork.category.id,
          name: artwork.category.name,
          slug: artwork.category.slug,
        }
      : null,
    createdAt: artwork.createdAt,
    media: (artwork.media ?? []).map((item) => ({
      id: item.id,
      alt: publicMediaAlt(artwork, item),
      width: item.width,
      height: item.height,
      isPrimary: item.isPrimary,
      sortOrder: item.sortOrder,
      src: {
        thumb: publicMediaPath(item.id, 'thumb', signingSecret),
        preview: publicMediaPath(item.id, 'preview', signingSecret),
        full: publicMediaPath(item.id, 'full', signingSecret),
      },
    })),
  };
}
