import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpsertSettingDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  key: string;

  @IsObject()
  value: Record<string, unknown> | string | number | boolean | null;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
