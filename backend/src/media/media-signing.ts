import { createHmac, timingSafeEqual } from 'crypto';

export function resolveMediaSigningSecret(env: {
  MEDIA_SIGNING_SECRET?: string;
  JWT_SECRET?: string;
}): string {
  const secret =
    env.MEDIA_SIGNING_SECRET?.trim() || env.JWT_SECRET?.trim() || '';
  if (!secret) {
    throw new Error('MEDIA_SIGNING_SECRET or JWT_SECRET is required');
  }
  return secret;
}

export function signMediaVariant(
  secret: string,
  mediaId: string,
  variant: string,
): string {
  return createHmac('sha256', secret)
    .update(`v1:${mediaId}:${variant}`)
    .digest('base64url')
    .slice(0, 32);
}

export function verifyMediaSignature(
  secret: string,
  mediaId: string,
  variant: string,
  signature: string | undefined,
): boolean {
  if (!signature) {
    return false;
  }
  const expected = signMediaVariant(secret, mediaId, variant);
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}

export function publicMediaPath(
  mediaId: string,
  variant: string,
  secret: string,
): string {
  const signature = signMediaVariant(secret, mediaId, variant);
  return `/api/public/media/${mediaId}/${variant}?s=${signature}`;
}
