import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Color } from '../../database/entities/color.entity';
import { ProductVariant } from '../../database/entities/product-variant.entity';
import { Size } from '../../database/entities/size.entity';
import { ProductsModule } from '../products/products.module';
import { VariantsController } from './variants.controller';
import { VariantsService } from './variants.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductVariant, Size, Color]),
    ProductsModule,
  ],
  controllers: [VariantsController],
  providers: [VariantsService],
  exports: [VariantsService],
})
export class VariantsModule {}
