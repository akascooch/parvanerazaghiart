import { Media } from '@prisma/client';

export type AdminMediaView = {
  id: string;
  artworkId: string;
  mimeType: string;
  sizeBytes: number;
  kind: Media['kind'];
  alt: string | null;
  width: number | null;
  height: number | null;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export function toAdminMedia(media: Media): AdminMediaView {
  return {
    id: media.id,
    artworkId: media.artworkId,
    mimeType: media.mimeType,
    sizeBytes: media.sizeBytes,
    kind: media.kind,
    alt: media.alt,
    width: media.width,
    height: media.height,
    sortOrder: media.sortOrder,
    isPrimary: media.isPrimary,
    createdAt: media.createdAt,
    updatedAt: media.updatedAt,
  };
}
