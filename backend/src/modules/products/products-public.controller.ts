import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { ProductQueryDto } from './dto/product-query.dto';
import { ProductsService } from './products.service';

@Controller()
export class ProductsPublicController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get('products')
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query, true);
  }

  @Public()
  @Get('products/:slug')
  findBySlug(
    @Param('slug') slug: string,
    @Query('divisionSlug') divisionSlug?: string,
  ) {
    return this.productsService.findBySlug(slug, divisionSlug);
  }

  @Public()
  @Get('divisions/:divisionSlug/products')
  findByDivision(
    @Param('divisionSlug') divisionSlug: string,
    @Query() query: ProductQueryDto,
  ) {
    return this.productsService.findAll(
      { ...query, divisionSlug },
      true,
    );
  }
}
