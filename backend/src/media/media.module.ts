import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminMediaController } from './admin-media.controller';
import { MediaDerivativesService } from './media-derivatives.service';
import { MediaStorageService } from './media-storage.service';
import { MediaService } from './media.service';
import { PublicMediaController } from './public-media.controller';

@Module({
  imports: [AuthModule],
  controllers: [AdminMediaController, PublicMediaController],
  providers: [MediaService, MediaStorageService, MediaDerivativesService],
  exports: [MediaService, MediaDerivativesService],
})
export class MediaModule {}
