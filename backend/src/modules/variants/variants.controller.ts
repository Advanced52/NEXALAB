import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ROLE_ADMIN, ROLE_STAFF } from '../../common/constants/roles';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { VariantsService } from './variants.service';

@Controller()
export class VariantsController {
  constructor(private readonly variantsService: VariantsService) {}

  @Public()
  @Get('sizes')
  findSizes() {
    return this.variantsService.findSizes();
  }

  @Public()
  @Get('colors')
  findColors() {
    return this.variantsService.findColors();
  }

  @Get('admin/products/:productId/variants')
  @Roles(ROLE_ADMIN, ROLE_STAFF)
  findByProduct(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.variantsService.findByProduct(productId);
  }

  @Post('admin/variants')
  @Roles(ROLE_ADMIN)
  create(@Body() dto: CreateVariantDto) {
    return this.variantsService.create(dto);
  }

  @Patch('admin/variants/:id')
  @Roles(ROLE_ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVariantDto,
  ) {
    return this.variantsService.update(id, dto);
  }

  @Delete('admin/variants/:id')
  @Roles(ROLE_ADMIN)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.variantsService.remove(id);
    return { message: 'Variante eliminada' };
  }

  @Post('admin/sizes')
  @Roles(ROLE_ADMIN)
  createSize(
    @Body() body: { name: string; code?: string; sortOrder?: number },
  ) {
    return this.variantsService.createSize(
      body.name,
      body.code,
      body.sortOrder,
    );
  }

  @Post('admin/colors')
  @Roles(ROLE_ADMIN)
  createColor(@Body() body: { name: string; hexCode?: string }) {
    return this.variantsService.createColor(body.name, body.hexCode);
  }
}
