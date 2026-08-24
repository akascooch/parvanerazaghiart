import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  DERIVATIVE_SPECS,
  DERIVATIVE_VARIANTS,
  derivativeStorageKey,
  type DerivativeMap,
  type DerivativeRecord,
  type DerivativeVariant,
} from './derivatives';
import { detectImageKind } from './image-bytes';
import { processDerivative, readJpegSize, readPngSize } from './image-processor';
import { MediaStorageService } from './media-storage.service';

@Injectable()
export class MediaDerivativesService {
  private readonly logger = new Logger(MediaDerivativesService.name);
  private readonly inflight = new Map<
    string,
    Promise<{ buffer: Buffer; mimeType: string } | null>
  >();

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: MediaStorageService,
  ) {}

  async generateAll(mediaId: string): Promise<void> {
    const media = await this.prisma.media.findUnique({ where: { id: mediaId } });
    if (!media) {
      return;
    }
    const original = await this.storage.read(media.storageKey);
    if (!original) {
      return;
    }
    const map: DerivativeMap = {};
    for (const variant of DERIVATIVE_VARIANTS) {
      const record = await this.writeVariant(
        media.artworkId,
        media.id,
        variant,
        original,
      );
      if (record) {
        map[variant] = record;
      }
    }
    await this.prisma.media.update({
      where: { id: media.id },
      data: { variants: map as Prisma.InputJsonValue },
    });
  }

  async getVariantBuffer(
    mediaId: string,
    variant: DerivativeVariant,
  ): Promise<{ buffer: Buffer; mimeType: string } | null> {
    const key = `${mediaId}:${variant}`;
    const existing = this.inflight.get(key);
    if (existing) {
      return existing;
    }
    const job = this.loadOrBuild(mediaId, variant);
    this.inflight.set(key, job);
    try {
      return await job;
    } finally {
      this.inflight.delete(key);
    }
  }

  async removeAll(artworkId: string, mediaId: string, stored?: unknown) {
    const keys = new Set<string>();
    for (const variant of DERIVATIVE_VARIANTS) {
      keys.add(derivativeStorageKey(artworkId, mediaId, variant));
    }
    keys.add(`${artworkId}/deriv/${mediaId}.original`);
    if (stored && typeof stored === 'object') {
      for (const value of Object.values(stored as DerivativeMap)) {
        if (value?.storageKey) {
          keys.add(value.storageKey);
        }
      }
    }
    await Promise.all([...keys].map((key) => this.storage.remove(key)));
  }

  private async loadOrBuild(
    mediaId: string,
    variant: DerivativeVariant,
  ): Promise<{ buffer: Buffer; mimeType: string } | null> {
    const media = await this.prisma.media.findUnique({ where: { id: mediaId } });
    if (!media) {
      return null;
    }
    const current = (media.variants as DerivativeMap | null) ?? {};
    const known = current[variant];
    if (known?.storageKey) {
      const cached = await this.storage.read(known.storageKey);
      if (cached) {
        return { buffer: cached, mimeType: known.mimeType };
      }
    }
    const original = await this.storage.read(media.storageKey);
    if (!original) {
      return null;
    }
    const record = await this.writeVariant(
      media.artworkId,
      media.id,
      variant,
      original,
    );
    if (!record) {
      this.logger.warn(`Could not derive ${variant} for media ${mediaId}`);
      return { buffer: original, mimeType: media.mimeType };
    }
    await this.prisma.media.update({
      where: { id: media.id },
      data: {
        variants: { ...current, [variant]: record } as Prisma.InputJsonValue,
      },
    });
    const buffer = await this.storage.read(record.storageKey);
    if (!buffer) {
      return null;
    }
    return { buffer, mimeType: record.mimeType };
  }

  private async writeVariant(
    artworkId: string,
    mediaId: string,
    variant: DerivativeVariant,
    original: Buffer,
  ): Promise<DerivativeRecord | null> {
    const processed = await processDerivative(
      original,
      DERIVATIVE_SPECS[variant].maxEdge,
    );
    if (processed) {
      const storageKey = derivativeStorageKey(artworkId, mediaId, variant);
      await this.storage.save(storageKey, processed.buffer, true);
      return {
        storageKey,
        mimeType: processed.mimeType,
        width: processed.width,
        height: processed.height,
        sizeBytes: processed.buffer.length,
      };
    }

    const passthroughKey = `${artworkId}/deriv/${mediaId}.original`;
    if (!this.storage.exists(passthroughKey)) {
      await this.storage.save(passthroughKey, original, true);
    }
    const size = readPngSize(original) ?? readJpegSize(original);
    const kind = detectImageKind(original);
    return {
      storageKey: passthroughKey,
      mimeType: kind?.mimeType ?? 'application/octet-stream',
      width: size?.width ?? 0,
      height: size?.height ?? 0,
      sizeBytes: original.length,
    };
  }
}
