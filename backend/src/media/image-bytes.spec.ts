import { detectImageKind, mimeMatchesDetection } from './image-bytes';

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

describe('detectImageKind', () => {
  it('accepts a PNG signature', () => {
    expect(detectImageKind(PNG_1X1)).toEqual({
      mimeType: 'image/png',
      extension: 'png',
    });
  });

  it('rejects non-image bytes', () => {
    expect(detectImageKind(Buffer.from('not-an-image'))).toBeNull();
  });

  it('rejects mime spoofing', () => {
    const detected = detectImageKind(PNG_1X1);
    expect(detected).not.toBeNull();
    expect(mimeMatchesDetection('image/jpeg', detected!)).toBe(false);
    expect(mimeMatchesDetection('image/png', detected!)).toBe(true);
  });
});
