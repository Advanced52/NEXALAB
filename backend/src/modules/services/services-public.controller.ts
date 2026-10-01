import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { ServicesService } from './services.service';

@Controller()
export class ServicesPublicController {
  constructor(private readonly servicesService: ServicesService) {}

  @Public()
  @Get('services')
  findAll(@Query('divisionSlug') divisionSlug?: string) {
    return this.servicesService.findAll({ divisionSlug, onlyActive: true });
  }

  @Public()
  @Get('services/:slug')
  findBySlug(
    @Param('slug') slug: string,
    @Query('divisionSlug') divisionSlug?: string,
  ) {
    return this.servicesService.findBySlug(slug, divisionSlug);
  }

  @Public()
  @Get('divisions/:divisionSlug/services')
  findByDivision(@Param('divisionSlug') divisionSlug: string) {
    return this.servicesService.findAll({ divisionSlug, onlyActive: true });
  }
}
