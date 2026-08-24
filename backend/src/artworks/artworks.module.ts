import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminArtworksController } from './admin-artworks.controller';
import { ArtworksController } from './artworks.controller';
import { PublicArtworksController } from './public-artworks.controller';
import { ArtworksService } from './artworks.service';

@Module({
  imports: [AuthModule],
  controllers: [ArtworksController, AdminArtworksController, PublicArtworksController],
  providers: [ArtworksService],
  exports: [ArtworksService],
})
export class ArtworksModule {}
