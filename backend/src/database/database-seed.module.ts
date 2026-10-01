import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogSeedService } from './catalog-seed.service';
import { DatabaseSeedService } from './database-seed.service';
import { BusinessDivision } from './entities/business-division.entity';
import { Category } from './entities/category.entity';
import { Color } from './entities/color.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { Product } from './entities/product.entity';
import { Role } from './entities/role.entity';
import { ServiceEntity } from './entities/service.entity';
import { Setting } from './entities/setting.entity';
import { Size } from './entities/size.entity';
import { User } from './entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Role,
      User,
      BusinessDivision,
      Category,
      Product,
      ProductImage,
      ProductVariant,
      ServiceEntity,
      Size,
      Color,
      Setting,
    ]),
  ],
  providers: [DatabaseSeedService, CatalogSeedService],
})
export class DatabaseSeedModule {}
