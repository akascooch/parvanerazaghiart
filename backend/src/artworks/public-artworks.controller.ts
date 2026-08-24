import { Controller, Get, Header, Param, Query } from '@nestjs/common';
import { ArtworksService } from './artworks.service';
import { PublicArtworksQueryDto } from './dto/public-artworks-query.dto';

@Controller('public/artworks')
export class PublicArtworksController {
  constructor(private readonly artworksService: ArtworksService) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
  list(@Query() query: PublicArtworksQueryDto) {
    return this.artworksService.listPublished(query);
  }

  @Get(':slug')
  @Header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
  findBySlug(@Param('slug') slug: string) {
    return this.artworksService.findPublishedBySlug(slug);
  }
}
