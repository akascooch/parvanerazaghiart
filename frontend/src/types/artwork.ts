export type ArtworkStatus = 'DRAFT' | 'PUBLISHED' | 'SOLD';

export type AdminMedia = {
  id: string;
  artworkId: string;
  mimeType: string;
  sizeBytes: number;
  kind: 'IMAGE';
  alt: string | null;
  width: number | null;
  height: number | null;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  artworkCount?: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminArtwork = {
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
  category: Pick<AdminCategory, 'id' | 'name' | 'slug'> | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  media: AdminMedia[];
};

export type ArtworkListResponse = {
  items: AdminArtwork[];
  total: number;
  page: number;
  limit: number;
};

export type ArtworkSummary = {
  total: number;
  published: number;
  drafts: number;
  sold: number;
};

export type PublicMedia = {
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

export type PublicArtwork = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: string | null;
  status: Exclude<ArtworkStatus, 'DRAFT'>;
  medium: string | null;
  technique: string | null;
  dimensions: string | null;
  collection: string | null;
  year: number | null;
  category: { id: string; name: string; slug: string } | null;
  createdAt: string;
  media: PublicMedia[];
};
