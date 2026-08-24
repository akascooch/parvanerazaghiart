export type {
  AdminArtwork,
  AdminCategory,
  AdminMedia,
  ArtworkListResponse,
  ArtworkStatus,
  ArtworkSummary,
  PublicArtwork,
  PublicMedia,
} from './artwork';

export type Artwork = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  price?: string | null;
  isPriceVisible: boolean;
  status: import('./artwork').ArtworkStatus;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: 'ADMIN';
};
