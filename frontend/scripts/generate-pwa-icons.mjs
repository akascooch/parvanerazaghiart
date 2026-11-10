import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function loadSharp() {
  const candidates = [
    path.join(root, 'node_modules', 'sharp'),
    path.join(root, 'node_modules', 'next', 'node_modules', 'sharp'),
  ];
  for (const candidate of candidates) {
    try {
      return require(candidate);
    } catch {
      /* try next */
    }
  }
  return require('sharp');
}

const sharp = loadSharp();

async function writeIcon(source, dest, size, { pad = 0.1, background = '#000000' } = {}) {
  const inset = Math.round(size * pad);
  const inner = size - inset * 2;
  const glyph = await sharp(source)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background,
    },
  })
    .composite([{ input: glyph, gravity: 'centre' }])
    .png()
    .toFile(dest);
}

async function main() {
  const source =
    process.argv[2] ||
    path.join(root, 'public', 'newv', 'mainlogo.png');
  if (!existsSync(source)) {
    throw new Error(`source-missing:${source}`);
  }
  const iconsDir = path.join(root, 'public', 'icons');
  mkdirSync(iconsDir, { recursive: true });
  await writeIcon(source, path.join(iconsDir, 'icon-192x192.png'), 192, { pad: 0.12 });
  await writeIcon(source, path.join(iconsDir, 'icon-512x512.png'), 512, { pad: 0.12 });
  await writeIcon(source, path.join(root, 'public', 'apple-touch-icon.png'), 180, { pad: 0.1 });
  console.log('art_icons=ok');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'icon-failed');
  process.exit(1);
});
