import { Controller, Get } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('public/categories')
export class PublicCategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  list() {
    return this.categories.list(false);
  }
}
