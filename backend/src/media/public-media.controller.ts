import {
  Controller,
  Get,
  Header,
  NotFoundException,
  Param,
  Query,
  Req,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ArtworkStatus } from '@prisma/client';
import type { Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { isDerivativeVariant } from './derivatives';
import { MediaDerivativesService } from './media-derivatives.service';
import {
  resolveMediaSigningSecret,
  verifyMediaSignature,
} from './media-signing';

@Controller('public/media')
export class PublicMediaController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly derivatives: MediaDerivativesService,
    private readonly config: ConfigService,
  ) {}

  @Get(':id/:variant')
  @Header('X-Content-Type-Options', 'nosniff')
  async file(
    @Param('id') id: string,
    @Param('variant') variant: string,
    @Query('s') signature: string | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!isDerivativeVariant(variant)) {
      throw new NotFoundException();
    }

    const secret = resolveMediaSigningSecret({
      MEDIA_SIGNING_SECRET: this.config.get<string>('MEDIA_SIGNING_SECRET'),
      JWT_SECRET: this.config.get<string>('JWT_SECRET'),
    });
    if (!verifyMediaSignature(secret, id, variant, signature)) {
      throw new NotFoundException();
    }

    const media = await this.prisma.media.findUnique({
      where: { id },
      include: { artwork: true },
    });
    if (
      !media ||
      media.artwork.deletedAt ||
      (media.artwork.status !== ArtworkStatus.PUBLISHED &&
        media.artwork.status !== ArtworkStatus.SOLD)
    ) {
      throw new NotFoundException();
    }

    const result = await this.derivatives.getVariantBuffer(id, variant);
    if (!result) {
      throw new NotFoundException();
    }

    const etag = `"${id}-${variant}-${result.buffer.length}"`;
    res.setHeader('ETag', etag);
    res.setHeader(
      'Cache-Control',
      'public, max-age=86400, stale-while-revalidate=604800',
    );
    if (req.headers['if-none-match'] === etag) {
      res.status(304);
      return;
    }

    return new StreamableFile(result.buffer, {
      type: result.mimeType,
      disposition: 'inline',
    });
  }
}
