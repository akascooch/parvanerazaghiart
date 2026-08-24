import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminCategoriesController } from './admin-categories.controller';
import { CategoriesService } from './categories.service';
import { PublicCategoriesController } from './public-categories.controller';

@Module({
  imports: [AuthModule],
  controllers: [AdminCategoriesController, PublicCategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
