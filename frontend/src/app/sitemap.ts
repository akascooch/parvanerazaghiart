import type { MetadataRoute } from 'next';
import { fetchPublicArtworks } from '@/lib/public-gallery';
import { siteUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const artworks = await fetchPublicArtworks({ limit: 48 });
  const now = new Date();
  return [
    { url: siteUrl('/'), lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: siteUrl('/gallery'), lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: siteUrl('/contact'), lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    ...artworks.map((artwork) => ({
      url: siteUrl(`/gallery/${artwork.slug}`),
      lastModified: artwork.createdAt,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
