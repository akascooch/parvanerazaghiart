export const MEDIA_MAX_BYTES = 12 * 1024 * 1024;
export const MEDIA_MAX_MB = MEDIA_MAX_BYTES / (1024 * 1024);
export const MEDIA_MAX_PER_ARTWORK = 12;
export const MEDIA_FIELD = 'file';

export const ALLOWED_IMAGE_MIME = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);
