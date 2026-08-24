import { Controller, Get } from '@nestjs/common';
import { ArtworksService } from './artworks.service';

@Controller('artworks')
export class ArtworksController {
  constructor(private readonly artworksService: ArtworksService) {}

  @Get('status')
  getStatus() {
    return this.artworksService.getStatus();
  }
}
