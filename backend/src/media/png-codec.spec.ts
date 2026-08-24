import { processDerivative } from './image-processor';
import { decodePngToRgba, encodePngRgba } from './png-codec';
import { resizeRgba } from './rgba-resize';

describe('PNG derivative pipeline', () => {
  it('round-trips RGBA through PNG encode/decode', () => {
    const width = 12;
    const height = 8;
    const data = new Uint8Array(width * height * 4);
    for (let i = 0; i < data.length; i += 1) {
      data[i] = i % 256;
    }
    const png = encodePngRgba(data, width, height);
    const decoded = decodePngToRgba(png);
    expect(decoded).not.toBeNull();
    expect(decoded?.width).toBe(width);
    expect(decoded?.height).toBe(height);
    expect(Array.from(decoded!.data.slice(0, 8))).toEqual(Array.from(data.slice(0, 8)));
  });

  it('resizes to the longest-edge limit', () => {
    const width = 12;
    const height = 8;
    const data = new Uint8Array(width * height * 4).fill(180);
    const resized = resizeRgba(data, width, height, 6);
    expect(resized.width).toBe(6);
    expect(resized.height).toBe(4);
  });

  it('builds a derivative from a PNG original', async () => {
    const width = 10;
    const height = 10;
    const data = new Uint8Array(width * height * 4).fill(90);
    data[3] = 255;
    const original = encodePngRgba(data, width, height);
    const processed = await processDerivative(original, 5);
    expect(processed).not.toBeNull();
    expect(['image/png', 'image/webp']).toContain(processed?.mimeType);
    expect(processed?.width).toBe(5);
    expect(processed?.height).toBe(5);
  });

  it('does not crash on truncated JPEG bytes', async () => {
    const jpegLike = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    await expect(processDerivative(jpegLike, 480)).resolves.toBeDefined();
  });
});
