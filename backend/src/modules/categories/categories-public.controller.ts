import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { CategoriesService } from './categories.service';

@Controller()
export class CategoriesPublicController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get('divisions/:divisionSlug/categories')
  findByDivision(@Param('divisionSlug') divisionSlug: string) {
    return this.categoriesService.findByDivisionSlug(divisionSlug);
  }

  @Public()
  @Get('divisions/:divisionSlug/categories/:categorySlug')
  findOne(
    @Param('divisionSlug') divisionSlug: string,
    @Param('categorySlug') categorySlug: string,
  ) {
    return this.categoriesService.findBySlugs(divisionSlug, categorySlug);
  }

  @Public()
  @Get('categories')
  findAll(@Query('divisionId') divisionId?: string) {
    return this.categoriesService.findAll(divisionId);
  }
}
