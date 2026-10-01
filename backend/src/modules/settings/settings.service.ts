import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from '../../database/entities/setting.entity';
import { UpsertSettingDto } from './dto/upsert-setting.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private readonly settingsRepository: Repository<Setting>,
  ) {}

  findPublic() {
    return this.settingsRepository.find({
      where: { isPublic: true },
      order: { key: 'ASC' },
    });
  }

  findAll() {
    return this.settingsRepository.find({ order: { key: 'ASC' } });
  }

  async findByKey(key: string): Promise<Setting> {
    const setting = await this.settingsRepository.findOne({ where: { key } });
    if (!setting) {
      throw new NotFoundException(`Setting "${key}" no encontrado`);
    }
    return setting;
  }

  async upsert(dto: UpsertSettingDto): Promise<Setting> {
    let setting = await this.settingsRepository.findOne({
      where: { key: dto.key },
    });

    if (!setting) {
      setting = this.settingsRepository.create({
        key: dto.key,
        value: dto.value,
        description: dto.description ?? null,
        isPublic: dto.isPublic ?? false,
      });
    } else {
      setting.value = dto.value;
      if (dto.description !== undefined) setting.description = dto.description;
      if (dto.isPublic !== undefined) setting.isPublic = dto.isPublic;
    }

    return this.settingsRepository.save(setting);
  }
}
