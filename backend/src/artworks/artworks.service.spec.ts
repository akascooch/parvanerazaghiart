import { ArtworkStatus } from '@prisma/client';
import { ArtworksService } from './artworks.service';
import { slugifyTitle } from './slug';

describe('slugifyTitle', () => {
  it('builds a url-safe slug', () => {
    expect(slugifyTitle('  Blue Silence  ')).toBe('blue-silence');
  });

  it('falls back when the title has no latin characters', () => {
    expect(slugifyTitle('سکوت آبی')).toBe('artwork');
  });
});

describe('ArtworksService', () => {
  const artwork = {
    id: 'art_1',
    title: 'Blue Silence',
    slug: 'blue-silence',
    description: null,
    price: null,
    isPriceVisible: false,
    status: ArtworkStatus.DRAFT,
    medium: null,
    technique: null,
    dimensions: null,
    collection: null,
    year: 2024,
    categoryId: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
  };

  let service: ArtworksService;
  let prisma: {
    artwork: {
      count: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    category: {
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      artwork: {
        count: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      category: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
    };
    service = new ArtworksService(prisma as never, {
      get: jest.fn().mockReturnValue('test-media-signing-secret'),
    } as never);
  });

  it('lists only non-deleted artworks', async () => {
    prisma.artwork.count.mockResolvedValue(1);
    prisma.artwork.findMany.mockResolvedValue([artwork]);

    const result = await service.list({ page: 1, limit: 20 });

    expect(prisma.artwork.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { deletedAt: null },
      }),
    );
    expect(result.items[0].title).toBe('Blue Silence');
    expect(result.items[0].isPriceVisible).toBe(false);
  });

  it('creates a draft artwork with a unique slug', async () => {
    prisma.artwork.findUnique.mockResolvedValue(null);
    prisma.artwork.create.mockResolvedValue(artwork);

    const created = await service.create({ title: 'Blue Silence' });

    expect(prisma.artwork.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: 'Blue Silence',
          slug: 'blue-silence',
          status: ArtworkStatus.DRAFT,
          isPriceVisible: false,
        }),
      }),
    );
    expect(created.slug).toBe('blue-silence');
  });

  it('soft-deletes by setting deletedAt', async () => {
    prisma.artwork.findFirst.mockResolvedValue(artwork);
    prisma.artwork.update.mockResolvedValue({ ...artwork, deletedAt: new Date() });

    await service.softDelete('art_1');

    expect(prisma.artwork.update).toHaveBeenCalledWith({
      where: { id: 'art_1' },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it('restores a soft-deleted artwork', async () => {
    const deleted = { ...artwork, deletedAt: new Date() };
    prisma.artwork.findUnique.mockResolvedValue(deleted);
    prisma.artwork.update.mockResolvedValue({ ...artwork, media: [] });

    const restored = await service.restore('art_1');

    expect(prisma.artwork.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'art_1' },
        data: { deletedAt: null },
      }),
    );
    expect(restored.deletedAt).toBeNull();
  });

  it('does not rewrite slug when only the title is updated', async () => {
    prisma.artwork.findFirst.mockResolvedValue(artwork);
    prisma.artwork.update.mockResolvedValue({ ...artwork, title: 'New Title' });

    await service.update('art_1', { title: 'New Title' });

    expect(prisma.artwork.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.not.objectContaining({ slug: expect.anything() }),
      }),
    );
  });

  it('lists published works with collection and title filters', async () => {
    prisma.artwork.count.mockResolvedValue(1);
    prisma.artwork.findMany.mockResolvedValue([artwork]);
    prisma.category.findMany.mockResolvedValue([]);

    await service.listPublished({
      q: 'Silence',
      collection: 'Studio Studies',
      page: 1,
      limit: 12,
    });

    expect(prisma.artwork.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deletedAt: null,
          title: { contains: 'Silence', mode: 'insensitive' },
          collection: { equals: 'Studio Studies', mode: 'insensitive' },
        }),
      }),
    );
  });
});
