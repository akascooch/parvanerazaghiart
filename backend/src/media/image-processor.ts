import { decodePngToRgba, encodePngRgba } from './png-codec';
import { resizeRgba } from './rgba-resize';

export type ProcessedImage = {
  buffer: Buffer;
  mimeType: 'image/png' | 'image/webp' | 'image/jpeg';
  width: number;
  height: number;
};

let sharpPromise: Promise<null | ((input: Buffer, opts?: object) => SharpChain)> | null =
  null;

type SharpChain = {
  rotate: () => SharpChain;
  metadata: () => Promise<{ width?: number; height?: number }>;
  resize: (opts: object) => SharpChain;
  webp: (opts: object) => SharpChain;
  toBuffer: () => Promise<Buffer>;
};

async function loadSharp() {
  if (!sharpPromise) {
    sharpPromise = Promise.resolve()
      .then(
        () =>
          Function('return import("sharp")')() as Promise<
            { default?: (input: Buffer, opts?: object) => SharpChain } & ((
              input: Buffer,
              opts?: object,
            ) => SharpChain)
          >,
      )
      .then((mod) => (mod.default ?? mod) as (input: Buffer, opts?: object) => SharpChain)
      .catch(() => null);
  }
  return sharpPromise;
}

export async function processDerivative(
  original: Buffer,
  maxEdge: number,
): Promise<ProcessedImage | null> {
  const sharp = await loadSharp();
  if (sharp) {
    try {
      const pipeline = sharp(original, { failOn: 'none' }).rotate();
      const meta = await pipeline.metadata();
      const width = meta.width ?? 0;
      const height = meta.height ?? 0;
      const longest = Math.max(width, height) || maxEdge;
      const scale = longest > maxEdge ? maxEdge / longest : 1;
      const outW = Math.max(1, Math.round(width * scale));
      const outH = Math.max(1, Math.round(height * scale));
      const buffer = await pipeline
        .resize({
          width: outW,
          height: outH,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 82 })
        .toBuffer();
      return { buffer, mimeType: 'image/webp', width: outW, height: outH };
    } catch {
      // Use the PNG codec or let the caller passthrough JPEG/WebP originals.
    }
  }

  const decoded = decodePngToRgba(original);
  if (!decoded) {
    return null;
  }
  const resized = resizeRgba(decoded.data, decoded.width, decoded.height, maxEdge);
  return {
    buffer: encodePngRgba(resized.data, resized.width, resized.height),
    mimeType: 'image/png',
    width: resized.width,
    height: resized.height,
  };
}

export function readPngSize(
  buffer: Buffer,
): { width: number; height: number } | null {
  if (buffer.length < 24 || buffer[0] !== 0x89 || buffer[1] !== 0x50) {
    return null;
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

export function readJpegSize(
  buffer: Buffer,
): { width: number; height: number } | null {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return null;
  }
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2;
      continue;
    }
    const size = buffer.readUInt16BE(offset + 2);
    offset += 2 + size;
  }
  return null;
}
