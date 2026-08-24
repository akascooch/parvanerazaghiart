import { backendUrl } from './backend';
import type { PublicArtwork } from '@/types';

export type PublicGalleryQuery = {
  q?: string;
  category?: string;
  collection?: string;
  technique?: string;
  page?: number;
  limit?: number;
};

export type PublicGalleryFacets = {
  categories: { name: string; slug: string }[];
  collections: string[];
  techniques: string[];
};

export type PublicGalleryResponse = {
  items: PublicArtwork[];
  total: number;
  page: number;
  limit: number;
  facets: PublicGalleryFacets;
};

const emptyFacets: PublicGalleryFacets = {
  categories: [],
  collections: [],
  techniques: [],
};

export async function fetchPublicGallery(
  query: PublicGalleryQuery = {},
): Promise<PublicGalleryResponse> {
  const params = new URLSearchParams();
  if (query.q) params.set('q', query.q);
  if (query.category) params.set('category', query.category);
  if (query.collection) params.set('collection', query.collection);
  if (query.technique) params.set('technique', query.technique);
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  const suffix = params.size ? `?${params.toString()}` : '';
  try {
    const response = await fetch(backendUrl(`/public/artworks${suffix}`), {
      next: { revalidate: 60 },
    });
    if (!response.ok) {
      return {
        items: [],
        total: 0,
        page: query.page ?? 1,
        limit: query.limit ?? 12,
        facets: emptyFacets,
      };
    }
    const data = (await response.json()) as Partial<PublicGalleryResponse>;
    return {
      items: data.items ?? [],
      total: data.total ?? 0,
      page: data.page ?? query.page ?? 1,
      limit: data.limit ?? query.limit ?? 12,
      facets: {
        categories: data.facets?.categories ?? [],
        collections: data.facets?.collections ?? [],
        techniques: data.facets?.techniques ?? [],
      },
    };
  } catch {
    return {
      items: [],
      total: 0,
      page: query.page ?? 1,
      limit: query.limit ?? 12,
      facets: emptyFacets,
    };
  }
}

export async function fetchPublicArtworks(
  query: PublicGalleryQuery = {},
): Promise<PublicArtwork[]> {
  return (await fetchPublicGallery(query)).items;
}

export async function fetchPublicArtwork(
  slug: string,
): Promise<PublicArtwork | null> {
  try {
    const response = await fetch(
      backendUrl(`/public/artworks/${encodeURIComponent(slug)}`),
      { next: { revalidate: 60 } },
    );
    if (response.status === 404 || !response.ok) {
      return null;
    }
    return (await response.json()) as PublicArtwork;
  } catch {
    return null;
  }
}

export function primaryMedia(artwork: PublicArtwork) {
  return artwork.media.find((item) => item.isPrimary) ?? artwork.media[0] ?? null;
}

export function formatPublicPrice(price: string | null): string {
  if (!price) {
    return 'Price on request';
  }
  const numeric = Number(price);
  if (!Number.isFinite(numeric)) {
    return price;
  }
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(numeric);
}
