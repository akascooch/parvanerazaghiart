import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { slugifyTitle } from '../artworks/slug';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(includeInactive = false) {
    const rows = await this.prisma.category.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: { artworks: { where: { deletedAt: null } } },
        },
      },
    });
    return rows.map(({ _count, ...category }) => ({
      ...category,
      artworkCount: _count.artworks,
    }));
  }

  async findById(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { artworks: { where: { deletedAt: null } } },
        },
      },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    const { _count, ...row } = category;
    return { ...row, artworkCount: _count.artworks };
  }

  async create(dto: CreateCategoryDto) {
    const slug = await this.uniqueSlug(slugifyTitle(dto.slug || dto.name));
    try {
      return await this.prisma.category.create({
        data: {
          name: dto.name,
          slug,
          description: dto.description,
          sortOrder: dto.sortOrder ?? 0,
        },
      });
    } catch (error) {
      this.rethrowUnique(error);
      throw error;
    }
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findById(id);
    const data: Prisma.CategoryUpdateInput = {
      name: dto.name,
      description: dto.description,
      sortOrder: dto.sortOrder,
      isActive: dto.isActive,
    };
    if (dto.slug || dto.name) {
      data.slug = await this.uniqueSlug(slugifyTitle(dto.slug || dto.name || ''), id);
    }
    try {
      return await this.prisma.category.update({ where: { id }, data });
    } catch (error) {
      this.rethrowUnique(error);
      throw error;
    }
  }

  async remove(id: string) {
    const category = await this.findById(id);
    const inUse = await this.prisma.artwork.count({
      where: { categoryId: id, deletedAt: null },
    });
    if (inUse > 0) {
      return this.prisma.category.update({
        where: { id },
        data: { isActive: false },
      });
    }
    await this.prisma.category.delete({ where: { id: category.id } });
    return { success: true, deleted: true };
  }

  private async uniqueSlug(base: string, ignoreId?: string): Promise<string> {
    let slug = base || 'category';
    let n = 2;
    for (;;) {
      const existing = await this.prisma.category.findUnique({ where: { slug } });
      if (!existing || existing.id === ignoreId) {
        return slug;
      }
      slug = `${base}-${n}`;
      n += 1;
    }
  }

  private rethrowUnique(error: unknown): void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Category slug already exists');
    }
  }
}
