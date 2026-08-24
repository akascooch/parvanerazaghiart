import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ArtworksService } from './artworks.service';
import { CreateArtworkDto } from './dto/create-artwork.dto';
import { ListArtworksQueryDto } from './dto/list-artworks-query.dto';
import { UpdateArtworkDto } from './dto/update-artwork.dto';

@Controller('admin/artworks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminArtworksController {
  constructor(private readonly artworksService: ArtworksService) {}

  @Get('summary')
  summary() {
    return this.artworksService.summary();
  }

  @Get()
  list(@Query() query: ListArtworksQueryDto) {
    return this.artworksService.list(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.artworksService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateArtworkDto) {
    return this.artworksService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateArtworkDto) {
    return this.artworksService.update(id, dto);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  restore(@Param('id') id: string) {
    return this.artworksService.restore(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.artworksService.softDelete(id);
  }
}
