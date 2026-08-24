import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ArtworkStatus, Prisma } from '@prisma/client';
import { resolveMediaSigningSecret } from '../media/media-signing';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArtworkDto } from './dto/create-artwork.dto';
import { ListArtworksQueryDto } from './dto/list-artworks-query.dto';
import { PublicArtworksQueryDto } from './dto/public-artworks-query.dto';
import { UpdateArtworkDto } from './dto/update-artwork.dto';
import { toAdminArtwork, toDecimal, toPublicArtwork } from './artworks.mapper';
import { slugifyTitle } from './slug';

const PUBLIC_STATUSES: ArtworkStatus[] = [
  ArtworkStatus.PUBLISHED,
  ArtworkStatus.SOLD,
];

@Injectable()
export class ArtworksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  getStatus() {
    return { module: 'artworks', ready: true, phase: 7 };
  }

  async summary() {
    const where = { deletedAt: null };
    const [total, published, drafts, sold] = await Promise.all([
      this.prisma.artwork.count({ where }),
      this.prisma.artwork.count({
        where: { ...where, status: ArtworkStatus.PUBLISHED },
      }),
      this.prisma.artwork.count({
        where: { ...where, status: ArtworkStatus.DRAFT },
      }),
      this.prisma.artwork.count({
        where: { ...where, status: ArtworkStatus.SOLD },
      }),
    ]);
    return { total, published, drafts, sold };
  }

  async list(query: ListArtworksQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.ArtworkWhereInput = query.deleted
      ? { deletedAt: { not: null } }
      : { deletedAt: null };

    if (query.status) {
      where.status = query.status;
    }
    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { slug: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const [total, rows] = await Promise.all([
      this.prisma.artwork.count({ where }),
      this.prisma.artwork.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      items: rows.map(toAdminArtwork),
      total,
      page,
      limit,
    };
  }

  async findById(id: string) {
    const artwork = await this.prisma.artwork.findFirst({
      where: { id, deletedAt: null },
      include: {
        media: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
        category: true,
      },
    });
    if (!artwork) {
      throw new NotFoundException('Artwork not found');
    }
    return toAdminArtwork(artwork);
  }

  async create(dto: CreateArtworkDto) {
    await this.assertCategory(dto.categoryId);
    const base = slugifyTitle(dto.slug || dto.title);
    const slug = dto.slug
      ? await this.assertSlugAvailable(base)
      : await this.uniqueSlug(base);
    const artwork = await this.prisma.artwork.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        price: toDecimal(dto.price),
        isPriceVisible: dto.isPriceVisible ?? false,
        status: dto.status ?? ArtworkStatus.DRAFT,
        medium: dto.medium,
        technique: dto.technique,
        dimensions: dto.dimensions,
        collection: dto.collection,
        year: dto.year,
        categoryId: dto.categoryId,
      },
      include: { category: true },
    });
    return toAdminArtwork(artwork);
  }

  async update(id: string, dto: UpdateArtworkDto) {
    const current = await this.findById(id);
    if (dto.categoryId !== undefined) {
      await this.assertCategory(dto.categoryId, current.categoryId);
    }
    const data: Prisma.ArtworkUpdateInput = {
      title: dto.title,
      description: dto.description,
      price: toDecimal(dto.price),
      isPriceVisible: dto.isPriceVisible,
      status: dto.status,
      medium: dto.medium,
      technique: dto.technique,
      dimensions: dto.dimensions,
      collection: dto.collection,
      year: dto.year,
      category:
        dto.categoryId === undefined
          ? undefined
          : dto.categoryId === null
            ? { disconnect: true }
            : { connect: { id: dto.categoryId } },
    };

    if (dto.slug) {
      data.slug = await this.assertSlugAvailable(slugifyTitle(dto.slug), id);
    }

    const artwork = await this.prisma.artwork.update({
      where: { id },
      data,
      include: {
        media: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
        category: true,
      },
    });
    return toAdminArtwork(artwork);
  }

  async softDelete(id: string) {
    await this.findById(id);
    await this.prisma.artwork.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { success: true };
  }

  async listPublished(query: PublicArtworksQueryDto = {}) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const where: Prisma.ArtworkWhereInput = {
      deletedAt: null,
      status: { in: PUBLIC_STATUSES },
    };

    if (query.q) {
      where.title = { contains: query.q, mode: 'insensitive' };
    }
    if (query.collection) {
      where.collection = { equals: query.collection, mode: 'insensitive' };
    }
    if (query.technique) {
      where.technique = { equals: query.technique, mode: 'insensitive' };
    }
    if (query.category) {
      where.category = {
        is: { slug: query.category, isActive: true },
      };
    }

    const facetWhere: Prisma.ArtworkWhereInput = {
      deletedAt: null,
      status: { in: PUBLIC_STATUSES },
    };

    const [total, rows, collectionRows, techniqueRows, categoryRows] =
      await Promise.all([
        this.prisma.artwork.count({ where }),
        this.prisma.artwork.findMany({
          where,
          include: {
            media: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
            category: true,
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        this.prisma.artwork.findMany({
          where: { ...facetWhere, collection: { not: null } },
          distinct: ['collection'],
          select: { collection: true },
          orderBy: { collection: 'asc' },
        }),
        this.prisma.artwork.findMany({
          where: { ...facetWhere, technique: { not: null } },
          distinct: ['technique'],
          select: { technique: true },
          orderBy: { technique: 'asc' },
        }),
        this.prisma.category.findMany({
          where: {
            isActive: true,
            artworks: {
              some: { deletedAt: null, status: { in: PUBLIC_STATUSES } },
            },
          },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
          select: { name: true, slug: true },
        }),
      ]);

    const secret = this.signingSecret();
    return {
      items: rows.map((row) => toPublicArtwork(row, secret)),
      total,
      page,
      limit,
      facets: {
        categories: categoryRows,
        collections: collectionRows
          .map((row) => row.collection)
          .filter((value): value is string => Boolean(value && value.trim())),
        techniques: techniqueRows
          .map((row) => row.technique)
          .filter((value): value is string => Boolean(value && value.trim())),
      },
    };
  }

  async findPublishedBySlug(slug: string) {
    const artwork = await this.prisma.artwork.findFirst({
      where: {
        slug,
        deletedAt: null,
        status: { in: PUBLIC_STATUSES },
      },
      include: {
        media: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
        category: true,
      },
    });
    if (!artwork) {
      throw new NotFoundException('Artwork not found');
    }
    return toPublicArtwork(artwork, this.signingSecret());
  }

  async restore(id: string) {
    const artwork = await this.prisma.artwork.findUnique({ where: { id } });
    if (!artwork) {
      throw new NotFoundException('Artwork not found');
    }
    if (!artwork.deletedAt) {
      return toAdminArtwork(artwork);
    }
    const restored = await this.prisma.artwork.update({
      where: { id },
      data: { deletedAt: null },
      include: {
        media: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
        category: true,
      },
    });
    return toAdminArtwork(restored);
  }

  private async assertCategory(
    categoryId?: string | null,
    currentCategoryId?: string | null,
  ) {
    if (!categoryId) {
      return;
    }
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new BadRequestException('Category not found or inactive');
    }
    if (!category.isActive && category.id !== currentCategoryId) {
      throw new BadRequestException('Category not found or inactive');
    }
  }

  private async assertSlugAvailable(
    slug: string,
    ignoreId?: string,
  ): Promise<string> {
    const existing = await this.prisma.artwork.findUnique({ where: { slug } });
    if (existing && existing.id !== ignoreId) {
      throw new ConflictException('Artwork slug already exists');
    }
    return slug;
  }

  private async uniqueSlug(base: string, ignoreId?: string): Promise<string> {
    let slug = base;
    let n = 2;
    for (;;) {
      const existing = await this.prisma.artwork.findUnique({
        where: { slug },
      });
      if (!existing || existing.id === ignoreId) {
        return slug;
      }
      slug = `${base}-${n}`;
      n += 1;
    }
  }

  private signingSecret() {
    return resolveMediaSigningSecret({
      MEDIA_SIGNING_SECRET: this.config.get<string>('MEDIA_SIGNING_SECRET'),
      JWT_SECRET: this.config.get<string>('JWT_SECRET'),
    });
  }
}
