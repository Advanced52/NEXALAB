import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ROLE_ADMIN, ROLE_STAFF } from '../../common/constants/roles';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServicesService } from './services.service';

@Controller('admin/services')
@Roles(ROLE_ADMIN, ROLE_STAFF)
export class ServicesAdminController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  findAll(@Query('divisionId') divisionId?: string) {
    return this.servicesService.findAll({
      divisionId,
      onlyActive: false,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.servicesService.findById(id);
  }

  @Post()
  @Roles(ROLE_ADMIN)
  create(@Body() dto: CreateServiceDto) {
    return this.servicesService.create(dto);
  }

  @Patch(':id')
  @Roles(ROLE_ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateServiceDto,
  ) {
    return this.servicesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(ROLE_ADMIN)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.servicesService.remove(id);
    return { message: 'Servicio eliminado' };
  }
}
