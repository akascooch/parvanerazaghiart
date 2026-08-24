import { ArtworkStatus, Prisma } from '@prisma/client';
import { publicMediaAlt, toPublicArtwork } from './artworks.mapper';

const now = new Date('2026-01-01T00:00:00.000Z');

function artwork(overrides: Record<string, unknown> = {}) {
  return {
    id: 'art_1',
    title: 'Studio Studies',
    slug: 'studio-studies',
    description: 'Studies',
    price: new Prisma.Decimal('48000000'),
    isPriceVisible: false,
    status: ArtworkStatus.PUBLISHED,
    medium: 'Oil',
    technique: 'Oil on canvas',
    dimensions: 'Variable',
    collection: 'Studio Studies',
    year: 2024,
    categoryId: 'cat_1',
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
    category: { id: 'cat_1', name: 'Paintings', slug: 'paintings' },
    media: [
      {
        id: 'media_1',
        alt: null,
        width: 100,
        height: 120,
        isPrimary: true,
        sortOrder: 0,
      },
    ],
    ...overrides,
  } as never;
}

describe('toPublicArtwork', () => {
  it('omits hidden prices and isPriceVisible', () => {
    const view = toPublicArtwork(artwork(), 'signing-secret');
    expect(view.price).toBeNull();
    expect(view).not.toHaveProperty('isPriceVisible');
    expect(view.collection).toBe('Studio Studies');
  });

  it('returns the price when visibility is on', () => {
    const view = toPublicArtwork(artwork({ isPriceVisible: true }), 'signing-secret');
    expect(view.price).toBe('48000000');
  });
});

describe('publicMediaAlt', () => {
  it('builds alt text from title and metadata when alt is empty', () => {
    expect(
      publicMediaAlt(
        {
          title: 'Studio Studies',
          technique: 'Oil on canvas',
          collection: 'Studio Studies',
          year: 2024,
        },
        { alt: '  ' },
      ),
    ).toBe('Studio Studies, Oil on canvas, Studio Studies, 2024');
  });

  it('includes category name when present', () => {
    expect(
      publicMediaAlt(
        {
          title: 'Studio Studies',
          technique: 'Oil on canvas',
          collection: 'Studio Studies',
          year: 2024,
          category: { name: 'Paintings' },
        },
        { alt: null },
      ),
    ).toBe('Studio Studies, Oil on canvas, Studio Studies, Paintings, 2024');
  });
});
