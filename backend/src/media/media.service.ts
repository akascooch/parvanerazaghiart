import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { MediaKind } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import {
  ALLOWED_IMAGE_MIME,
  MEDIA_MAX_BYTES,
  MEDIA_MAX_MB,
  MEDIA_MAX_PER_ARTWORK,
} from './media.constants';
import { detectImageKind, mimeMatchesDetection } from './image-bytes';
import { readJpegSize, readPngSize } from './image-processor';
import { MediaDerivativesService } from './media-derivatives.service';
import { MediaStorageService } from './media-storage.service';
import { toAdminMedia } from './media.mapper';

type UploadedFile = {
  buffer: Buffer;
  mimetype: string;
  size: number;
  originalname: string;
};

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: MediaStorageService,
    private readonly derivatives: MediaDerivativesService,
  ) {}

  async listForArtwork(artworkId: string) {
    await this.requireActiveArtwork(artworkId);
    const rows = await this.prisma.media.findMany({
      where: { artworkId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return rows.map(toAdminMedia);
  }

  async upload(artworkId: string, file?: UploadedFile) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('File is required');
    }
    if (file.size > MEDIA_MAX_BYTES) {
      throw new BadRequestException(`File exceeds the ${MEDIA_MAX_MB}MB limit`);
    }
    if (!ALLOWED_IMAGE_MIME.has(file.mimetype.toLowerCase())) {
      throw new BadRequestException('Only JPEG, PNG, and WebP images are allowed');
    }

    const detected = detectImageKind(file.buffer);
    if (!detected) {
      throw new BadRequestException('File content is not a valid JPEG, PNG, or WebP image');
    }
    if (!mimeMatchesDetection(file.mimetype, detected)) {
      throw new BadRequestException('Declared file type does not match file content');
    }

    const artwork = await this.requireActiveArtwork(artworkId);
    const existingCount = await this.prisma.media.count({ where: { artworkId } });
    if (existingCount >= MEDIA_MAX_PER_ARTWORK) {
      throw new BadRequestException(`At most ${MEDIA_MAX_PER_ARTWORK} images per artwork`);
    }

    const storageKey = `${artwork.id}/${randomUUID()}.${detected.extension}`;
    const size = readPngSize(file.buffer) ?? readJpegSize(file.buffer);
    await this.storage.save(storageKey, file.buffer);

    try {
      const media = await this.prisma.$transaction(async (tx) => {
        const makePrimary = existingCount === 0;
        if (makePrimary) {
          await tx.media.updateMany({
            where: { artworkId },
            data: { isPrimary: false },
          });
        }

        const created = await tx.media.create({
          data: {
            artworkId,
            storageKey,
            url: 'pending',
            mimeType: detected.mimeType,
            sizeBytes: file.size,
            kind: MediaKind.IMAGE,
            sortOrder: existingCount,
            isPrimary: makePrimary,
            width: size?.width,
            height: size?.height,
          },
        });
        return tx.media.update({
          where: { id: created.id },
          data: { url: `/api/admin/media/${created.id}/file` },
        });
      });

      void this.derivatives.generateAll(media.id).catch((error: unknown) => {
        this.logger.warn(
          `Derivative generation failed for ${media.id}: ${
            error instanceof Error ? error.message : 'unknown error'
          }`,
        );
      });

      return toAdminMedia(media);
    } catch (error) {
      await this.storage.remove(storageKey);
      throw error;
    }
  }

  async setPrimary(artworkId: string, mediaId: string) {
    await this.requireActiveArtwork(artworkId);
    const media = await this.requireArtworkMedia(artworkId, mediaId);

    await this.prisma.$transaction([
      this.prisma.media.updateMany({
        where: { artworkId },
        data: { isPrimary: false },
      }),
      this.prisma.media.update({
        where: { id: media.id },
        data: { isPrimary: true },
      }),
    ]);

    return this.listForArtwork(artworkId);
  }

  async reorder(artworkId: string, ids: string[]) {
    await this.requireActiveArtwork(artworkId);
    const existing = await this.prisma.media.findMany({
      where: { artworkId },
      select: { id: true },
    });
    const existingIds = existing.map((row) => row.id).sort();
    const incoming = [...ids].sort();
    if (
      existingIds.length !== incoming.length ||
      existingIds.some((id, index) => id !== incoming[index])
    ) {
      throw new BadRequestException('Reorder payload must include every media id exactly once');
    }

    await this.prisma.$transaction(
      ids.map((id, sortOrder) =>
        this.prisma.media.update({
          where: { id },
          data: { sortOrder },
        }),
      ),
    );

    return this.listForArtwork(artworkId);
  }

  async remove(artworkId: string, mediaId: string) {
    await this.requireActiveArtwork(artworkId);
    const media = await this.requireArtworkMedia(artworkId, mediaId);

    await this.prisma.$transaction(async (tx) => {
      await tx.media.delete({ where: { id: media.id } });
      if (media.isPrimary) {
        const next = await tx.media.findFirst({
          where: { artworkId },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        });
        if (next) {
          await tx.media.update({
            where: { id: next.id },
            data: { isPrimary: true },
          });
        }
      }
    });

    await this.derivatives.removeAll(artworkId, mediaId, media.variants);
    await this.storage.remove(media.storageKey);
    return { success: true };
  }

  async openFile(mediaId: string) {
    const media = await this.prisma.media.findUnique({ where: { id: mediaId } });
    if (!media) {
      throw new NotFoundException('Media not found');
    }
    const stream = this.storage.openReadStream(media.storageKey);
    if (!stream) {
      throw new NotFoundException('Media file is missing');
    }
    return { media, stream };
  }

  private async requireActiveArtwork(artworkId: string) {
    const artwork = await this.prisma.artwork.findFirst({
      where: { id: artworkId },
    });
    if (!artwork) {
      throw new NotFoundException('Artwork not found');
    }
    if (artwork.deletedAt) {
      throw new ConflictException('Cannot attach media to a deleted artwork');
    }
    return artwork;
  }

  private async requireArtworkMedia(artworkId: string, mediaId: string) {
    const media = await this.prisma.media.findFirst({
      where: { id: mediaId, artworkId },
    });
    if (!media) {
      throw new NotFoundException('Media not found');
    }
    return media;
  }
}
