import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessDivision } from '../../database/entities/business-division.entity';
import { DivisionsAdminController } from './divisions-admin.controller';
import { DivisionsPublicController } from './divisions-public.controller';
import { DivisionsService } from './divisions.service';

@Module({
  imports: [TypeOrmModule.forFeature([BusinessDivision])],
  controllers: [DivisionsPublicController, DivisionsAdminController],
  providers: [DivisionsService],
  exports: [DivisionsService],
})
export class DivisionsModule {}
