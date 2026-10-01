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
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateDivisionDto } from './dto/create-division.dto';
import { UpdateDivisionDto } from './dto/update-division.dto';
import { DivisionsService } from './divisions.service';

@Controller('admin/divisions')
@Roles(ROLE_ADMIN, ROLE_STAFF)
export class DivisionsAdminController {
  constructor(private readonly divisionsService: DivisionsService) {}

  @Get()
  findAll() {
    return this.divisionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.divisionsService.findById(id);
  }

  @Post()
  @Roles(ROLE_ADMIN)
  create(@Body() dto: CreateDivisionDto) {
    return this.divisionsService.create(dto);
  }

  @Patch(':id')
  @Roles(ROLE_ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDivisionDto,
  ) {
    return this.divisionsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(ROLE_ADMIN)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.divisionsService.remove(id);
    return { message: 'División eliminada' };
  }
}
