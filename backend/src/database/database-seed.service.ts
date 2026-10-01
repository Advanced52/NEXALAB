import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { ROLE_ADMIN, SYSTEM_ROLES } from '../common/constants/roles';
import { CatalogSeedService } from './catalog-seed.service';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';
import { UserStatus } from './enums';

@Injectable()
export class DatabaseSeedService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeedService.name);

  constructor(
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly catalogSeedService: CatalogSeedService,
  ) {}

  async onModuleInit() {
    await this.seedRoles();
    await this.seedAdmin();
    await this.catalogSeedService.seed();
  }

  private async seedRoles() {
    for (const roleDef of SYSTEM_ROLES) {
      const existing = await this.rolesRepository.findOne({
        where: { name: roleDef.name },
      });

      if (!existing) {
        await this.rolesRepository.save(
          this.rolesRepository.create({
            name: roleDef.name,
            description: roleDef.description,
          }),
        );
        this.logger.log(`Rol creado: ${roleDef.name}`);
      }
    }
  }

  private async seedAdmin() {
    const email = this.configService
      .get<string>('app.adminEmail', 'admin@nexalab.local')
      .toLowerCase()
      .trim();
    const password = this.configService.get<string>(
      'app.adminPassword',
      'ChangeMeAdmin123!',
    );
    const name = this.configService.get<string>(
      'app.adminName',
      'Administrador NEXALAB',
    );

    const existing = await this.usersRepository.findOne({ where: { email } });
    if (existing) {
      this.logger.log(`Admin ya existe: ${email}`);
      return;
    }

    const adminRole = await this.rolesRepository.findOne({
      where: { name: ROLE_ADMIN },
    });

    if (!adminRole) {
      this.logger.error('No se pudo crear admin: rol admin ausente');
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await this.usersRepository.save(
      this.usersRepository.create({
        name,
        email,
        passwordHash,
        roleId: adminRole.id,
        role: adminRole,
        status: UserStatus.ACTIVE,
      }),
    );

    this.logger.log(`Usuario administrador creado: ${email}`);
  }
}
