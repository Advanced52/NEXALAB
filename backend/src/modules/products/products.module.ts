import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductImage } from '../../database/entities/product-image.entity';
import { Product } from '../../database/entities/product.entity';
import { CategoriesModule } from '../categories/categories.module';
import { DivisionsModule } from '../divisions/divisions.module';
import { ProductsAdminController } from './products-admin.controller';
import { ProductsPublicController } from './products-public.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage]),
    DivisionsModule,
    CategoriesModule,
  ],
  controllers: [ProductsPublicController, ProductsAdminController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
