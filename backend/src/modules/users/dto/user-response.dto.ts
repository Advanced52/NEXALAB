import { Exclude, Expose, Type } from 'class-transformer';
import { UserStatus } from '../../../database/enums';

class RoleResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;
}

@Exclude()
export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  status: UserStatus;

  @Expose()
  @Type(() => RoleResponseDto)
  role: RoleResponseDto;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
