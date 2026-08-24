const { PrismaClient, UserRole, ArtworkStatus, MediaKind } = require('@prisma/client');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const engines = path.join(__dirname, '..', 'prisma-engines-manual');
if (fs.existsSync(path.join(engines, 'query_engine.dll.node'))) {
  process.env.PRISMA_QUERY_ENGINE_LIBRARY = path.join(
    engines,
    'query_engine.dll.node',
  );
  process.env.PRISMA_SCHEMA_ENGINE_BINARY = path.join(
    engines,
    'schema-engine.exe',
  );
  process.env.PRISMA_ENGINES_CHECKSUM_IGNORE_CHECKS = '1';
}

function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    return;
  }
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const eq = trimmed.indexOf('=');
    if (eq === -1) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function normalizePhone(value) {
  const digits = String(value).replace(/\D/g, '');
  let local = digits;
  if (local.startsWith('0098')) {
    local = local.slice(4);
  } else if (local.startsWith('98')) {
    local = local.slice(2);
  }
  if (local.startsWith('9') && local.length === 10) {
    local = `0${local}`;
  }
  return /^09\d{9}$/.test(local) ? local : null;
}

function readJpegSize(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return { width: null, height: null };
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
  return { width: null, height: null };
}

const prisma = new PrismaClient();

async function seedAdmin() {
  loadEnvFile();
  const phone = normalizePhone(process.env.ADMIN_PHONE || '');
  const password = process.env.ADMIN_PASSWORD || '';
  const name = process.env.ADMIN_NAME || 'Gallery Admin';
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase()
    || (phone ? `admin+${phone}@local.invalid` : '');

  if (!password || (!email && !phone)) {
    console.warn('[seed] ADMIN_EMAIL/ADMIN_PHONE and ADMIN_PASSWORD are required.');
    return;
  }
  if (password.length < 8) {
    throw new Error('[seed] ADMIN_PASSWORD must be at least 8 characters.');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const existing =
    (phone && (await prisma.user.findUnique({ where: { phone } })))
    || (email && (await prisma.user.findUnique({ where: { email } })))
    || null;

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        email: email || existing.email,
        phone: phone || existing.phone,
        passwordHash,
        name,
        role: UserRole.ADMIN,
        isActive: true,
      },
    });
  } else {
    await prisma.user.create({
      data: {
        email,
        phone,
        passwordHash,
        name,
        role: UserRole.ADMIN,
        isActive: true,
      },
    });
  }

  console.log(`[seed] Admin user ready${phone ? ` (phone set)` : ''}: ${email}`);
}

async function seedSampleArtwork() {
  const paintingsDir = path.join(
    __dirname,
    '..',
    '..',
    'frontend',
    'src',
    'public',
    'paintings',
  );
  const files = ['test1.jpg', 'test2.jpg', 'test3.jpg', 'test4.jpg'];
  if (files.some((file) => !fs.existsSync(path.join(paintingsDir, file)))) {
    console.warn('[seed] Sample paintings folder is incomplete — skipping ingest.');
    return;
  }

  const category = await prisma.category.upsert({
    where: { slug: 'paintings' },
    update: { name: 'Paintings', isActive: true, sortOrder: 0 },
    create: {
      name: 'Paintings',
      slug: 'paintings',
      description: 'Oil and mixed-media paintings',
      sortOrder: 0,
      isActive: true,
    },
  });

  const artwork = await prisma.artwork.upsert({
    where: { slug: 'studio-studies' },
    update: {
      title: 'Studio Studies',
      description:
        'Four observational studies from the studio. Price is available on request.',
      price: 48000000,
      isPriceVisible: false,
      status: ArtworkStatus.PUBLISHED,
      medium: 'Oil',
      technique: 'Oil on canvas',
      dimensions: 'Variable',
      collection: 'Studio Studies',
      year: 2024,
      categoryId: category.id,
      deletedAt: null,
    },
    create: {
      title: 'Studio Studies',
      slug: 'studio-studies',
      description:
        'Four observational studies from the studio. Price is available on request.',
      price: 48000000,
      isPriceVisible: false,
      status: ArtworkStatus.PUBLISHED,
      medium: 'Oil',
      technique: 'Oil on canvas',
      dimensions: 'Variable',
      collection: 'Studio Studies',
      year: 2024,
      categoryId: category.id,
    },
  });

  const mediaRoot = path.resolve(
    process.env.MEDIA_ROOT || path.join(__dirname, '..', 'storage', 'media'),
  );
  const existing = await prisma.media.findMany({
    where: { artworkId: artwork.id },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });
  if (existing.length >= 4) {
    for (let index = 0; index < existing.length; index += 1) {
      await prisma.media.update({
        where: { id: existing[index].id },
        data: {
          sortOrder: index,
          isPrimary: index === 0,
        },
      });
    }
    console.log('[seed] Sample artwork media already present.');
    return;
  }

  for (const item of existing) {
    const abs = path.join(mediaRoot, item.storageKey);
    if (fs.existsSync(abs)) {
      fs.unlinkSync(abs);
    }
  }
  await prisma.media.deleteMany({ where: { artworkId: artwork.id } });

  for (let index = 0; index < files.length; index += 1) {
    const filename = files[index];
    const source = path.join(paintingsDir, filename);
    const buffer = fs.readFileSync(source);
    const size = readJpegSize(buffer);
    const storageKey = `${artwork.id}/${crypto.randomUUID()}.jpg`;
    const target = path.join(mediaRoot, storageKey);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);

    const created = await prisma.media.create({
      data: {
        artworkId: artwork.id,
        storageKey,
        url: 'pending',
        mimeType: 'image/jpeg',
        sizeBytes: buffer.length,
        kind: MediaKind.IMAGE,
        alt: `Studio Studies ${index + 1}`,
        width: size.width,
        height: size.height,
        sortOrder: index,
        isPrimary: index === 0,
      },
    });
    await prisma.media.update({
      where: { id: created.id },
      data: { url: `/api/admin/media/${created.id}/file` },
    });
  }

  console.log(`[seed] Ingested ${files.length} sample images for ${artwork.slug}`);
}

async function main() {
  await seedAdmin();
  await seedSampleArtwork();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
