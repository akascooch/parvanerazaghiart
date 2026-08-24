export function resizeRgba(
  src: Uint8Array,
  srcW: number,
  srcH: number,
  maxEdge: number,
): { data: Uint8Array; width: number; height: number } {
  if (srcW < 1 || srcH < 1) {
    throw new Error('Invalid source dimensions');
  }
  const longest = Math.max(srcW, srcH);
  const scale = longest > maxEdge ? maxEdge / longest : 1;
  const width = Math.max(1, Math.round(srcW * scale));
  const height = Math.max(1, Math.round(srcH * scale));
  if (width === srcW && height === srcH) {
    return { data: new Uint8Array(src), width, height };
  }

  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    const srcY = Math.min(srcH - 1, Math.floor(((y + 0.5) * srcH) / height));
    for (let x = 0; x < width; x += 1) {
      const srcX = Math.min(srcW - 1, Math.floor(((x + 0.5) * srcW) / width));
      const si = (srcY * srcW + srcX) * 4;
      const di = (y * width + x) * 4;
      data[di] = src[si];
      data[di + 1] = src[si + 1];
      data[di + 2] = src[si + 2];
      data[di + 3] = src[si + 3];
    }
  }
  return { data, width, height };
}
