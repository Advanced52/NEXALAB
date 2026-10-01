import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ROLE_ADMIN } from '../../common/constants/roles';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../database/entities/role.entity';

@Controller('admin/roles')
@Roles(ROLE_ADMIN)
export class RolesController {
  constructor(
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
  ) {}

  @Get()
  findAll() {
    return this.rolesRepository.find({
      order: { name: 'ASC' },
      select: ['id', 'name', 'description', 'createdAt'],
    });
  }
}
