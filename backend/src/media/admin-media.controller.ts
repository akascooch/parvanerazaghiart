import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ReorderMediaDto } from './dto/reorder-media.dto';
import { MEDIA_FIELD, MEDIA_MAX_BYTES } from './media.constants';
import { MediaService } from './media.service';

type UploadedFilePayload = {
  buffer: Buffer;
  mimetype: string;
  size: number;
  originalname: string;
};

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminMediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get('admin/artworks/:artworkId/media')
  list(@Param('artworkId') artworkId: string) {
    return this.mediaService.listForArtwork(artworkId);
  }

  @Post('admin/artworks/:artworkId/media')
  @UseInterceptors(
    FileInterceptor(MEDIA_FIELD, {
      limits: { fileSize: MEDIA_MAX_BYTES, files: 1 },
    }),
  )
  upload(
    @Param('artworkId') artworkId: string,
    @UploadedFile() file: UploadedFilePayload,
  ) {
    return this.mediaService.upload(artworkId, file);
  }

  @Patch('admin/artworks/:artworkId/media/reorder')
  reorder(
    @Param('artworkId') artworkId: string,
    @Body() dto: ReorderMediaDto,
  ) {
    return this.mediaService.reorder(artworkId, dto.ids);
  }

  @Patch('admin/artworks/:artworkId/media/:mediaId/primary')
  setPrimary(
    @Param('artworkId') artworkId: string,
    @Param('mediaId') mediaId: string,
  ) {
    return this.mediaService.setPrimary(artworkId, mediaId);
  }

  @Delete('admin/artworks/:artworkId/media/:mediaId')
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('artworkId') artworkId: string,
    @Param('mediaId') mediaId: string,
  ) {
    return this.mediaService.remove(artworkId, mediaId);
  }

  @Get('admin/media/:id/file')
  @Header('X-Content-Type-Options', 'nosniff')
  @Header('Cache-Control', 'private, no-store')
  async file(@Param('id') id: string) {
    const { media, stream } = await this.mediaService.openFile(id);
    return new StreamableFile(stream, {
      type: media.mimeType,
      disposition: 'inline',
    });
  }
}
