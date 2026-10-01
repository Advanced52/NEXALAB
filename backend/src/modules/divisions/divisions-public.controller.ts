import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { DivisionsService } from './divisions.service';

@Controller('divisions')
export class DivisionsPublicController {
  constructor(private readonly divisionsService: DivisionsService) {}

  @Public()
  @Get()
  findAll() {
    return this.divisionsService.findAllActive();
  }

  @Public()
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.divisionsService.findBySlugWithCatalog(slug);
  }
}
