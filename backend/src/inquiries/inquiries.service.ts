import { createHash } from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ArtworkStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { UpdateInquiryDto } from './dto/update-inquiry.dto';
import { InquiryRateLimitService } from './inquiry-rate-limit.service';

@Injectable()
export class InquiriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly limiter: InquiryRateLimitService,
    private readonly config: ConfigService,
  ) {}

  async create(
    dto: CreateInquiryDto,
    meta: { ip?: string; userAgent?: string },
  ) {
    const ipHash = this.hashIp(meta.ip);
    this.limiter.assertAllowed(ipHash);
    this.limiter.record(ipHash);

    if (dto.website) {
      return { received: true };
    }

    const artwork = dto.artworkSlug
      ? await this.prisma.artwork.findFirst({
          where: {
            slug: dto.artworkSlug,
            deletedAt: null,
            status: { in: [ArtworkStatus.PUBLISHED, ArtworkStatus.SOLD] },
          },
          select: { id: true, slug: true, title: true },
        })
      : null;

    await this.prisma.inquiry.create({
      data: {
        name: dto.name,
        contact: dto.contact,
        message: dto.message,
        artworkSlug: artwork?.slug ?? dto.artworkSlug ?? null,
        artworkId: artwork?.id ?? null,
        ipHash,
        userAgent: (meta.userAgent ?? '').slice(0, 180) || null,
      },
    });

    return { received: true };
  }

  list() {
    return this.prisma.inquiry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        name: true,
        contact: true,
        message: true,
        artworkSlug: true,
        status: true,
        createdAt: true,
        artwork: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
          },
        },
      },
    });
  }

  update(id: string, dto: UpdateInquiryDto) {
    return this.prisma.inquiry.update({
      where: { id },
      data: { status: dto.status },
      select: {
        id: true,
        status: true,
        updatedAt: true,
      },
    });
  }

  private hashIp(ip?: string) {
    const secret =
      this.config.get<string>('INQUIRY_HASH_SECRET') ||
      this.config.get<string>('JWT_SECRET') ||
      'inquiry-hash';
    return createHash('sha256')
      .update(`${secret}:${ip || 'unknown'}`)
      .digest('hex');
  }
}
