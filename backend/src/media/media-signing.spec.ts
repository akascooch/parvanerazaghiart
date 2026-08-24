import {
  publicMediaPath,
  resolveMediaSigningSecret,
  signMediaVariant,
  verifyMediaSignature,
} from './media-signing';

describe('media signing', () => {
  const secret = 'phase6-signing-secret';

  it('prefers MEDIA_SIGNING_SECRET over JWT_SECRET', () => {
    expect(
      resolveMediaSigningSecret({
        MEDIA_SIGNING_SECRET: 'dedicated',
        JWT_SECRET: 'jwt',
      }),
    ).toBe('dedicated');
  });

  it('falls back to JWT_SECRET', () => {
    expect(resolveMediaSigningSecret({ JWT_SECRET: 'jwt-only' })).toBe('jwt-only');
  });

  it('accepts a matching HMAC and rejects a mutated one', () => {
    const signature = signMediaVariant(secret, 'media_1', 'thumb');
    expect(verifyMediaSignature(secret, 'media_1', 'thumb', signature)).toBe(true);
    expect(verifyMediaSignature(secret, 'media_1', 'thumb', undefined)).toBe(false);
    expect(
      verifyMediaSignature(secret, 'media_1', 'thumb', `${signature.slice(0, -1)}x`),
    ).toBe(false);
    expect(verifyMediaSignature(secret, 'media_1', 'preview', signature)).toBe(false);
  });

  it('builds a public path without exposing storage keys', () => {
    const path = publicMediaPath('media_1', 'preview', secret);
    expect(path.startsWith('/api/public/media/media_1/preview?s=')).toBe(true);
    expect(path).not.toContain('storage');
    expect(path).not.toContain('deriv');
  });
});
