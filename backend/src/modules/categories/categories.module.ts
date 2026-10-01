import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../../database/entities/category.entity';
import { DivisionsModule } from '../divisions/divisions.module';
import { CategoriesAdminController } from './categories-admin.controller';
import { CategoriesPublicController } from './categories-public.controller';
import { CategoriesService } from './categories.service';

@Module({
  imports: [TypeOrmModule.forFeature([Category]), DivisionsModule],
  controllers: [CategoriesPublicController, CategoriesAdminController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
