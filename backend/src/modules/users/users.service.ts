import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { ROLE_CUSTOMER } from '../../common/constants/roles';
import { Role } from '../../database/entities/role.entity';
import { User } from '../../database/entities/user.entity';
import { UserStatus } from '../../database/enums';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly saltRounds = 12;

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.usersRepository.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }

    const role = await this.resolveRole(dto.roleId, dto.roleName ?? ROLE_CUSTOMER);
    const passwordHash = await bcrypt.hash(dto.password, this.saltRounds);

    const user = this.usersRepository.create({
      name: dto.name.trim(),
      email,
      passwordHash,
      roleId: role.id,
      role,
      status: dto.status ?? UserStatus.ACTIVE,
    });

    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email: email.toLowerCase().trim() },
    });
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (dto.email && dto.email.toLowerCase().trim() !== user.email) {
      const email = dto.email.toLowerCase().trim();
      const existing = await this.usersRepository.findOne({ where: { email } });
      if (existing) {
        throw new ConflictException('El email ya está registrado');
      }
      user.email = email;
    }

    if (dto.name) {
      user.name = dto.name.trim();
    }

    if (dto.status) {
      user.status = dto.status;
    }

    if (dto.password) {
      user.passwordHash = await bcrypt.hash(dto.password, this.saltRounds);
    }

    if (dto.roleId || dto.roleName) {
      const role = await this.resolveRole(dto.roleId, dto.roleName);
      user.roleId = role.id;
      user.role = role;
    }

    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.usersRepository.remove(user);
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  private async resolveRole(roleId?: string, roleName?: string): Promise<Role> {
    if (roleId) {
      const role = await this.rolesRepository.findOne({ where: { id: roleId } });
      if (!role) {
        throw new NotFoundException('Rol no encontrado');
      }
      return role;
    }

    const name = roleName ?? ROLE_CUSTOMER;
    const role = await this.rolesRepository.findOne({ where: { name } });
    if (!role) {
      throw new NotFoundException(`Rol "${name}" no encontrado`);
    }
    return role;
  }
}
