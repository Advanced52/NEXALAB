import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceEntity } from '../../database/entities/service.entity';
import { CategoriesModule } from '../categories/categories.module';
import { DivisionsModule } from '../divisions/divisions.module';
import { ServicesAdminController } from './services-admin.controller';
import { ServicesPublicController } from './services-public.controller';
import { ServicesService } from './services.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceEntity]),
    DivisionsModule,
    CategoriesModule,
  ],
  controllers: [ServicesPublicController, ServicesAdminController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
