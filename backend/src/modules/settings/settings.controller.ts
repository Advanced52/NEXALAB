import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ROLE_ADMIN } from '../../common/constants/roles';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UpsertSettingDto } from './dto/upsert-setting.dto';
import { SettingsService } from './settings.service';

@Controller()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Public()
  @Get('settings/public')
  findPublic() {
    return this.settingsService.findPublic();
  }

  @Get('admin/settings')
  @Roles(ROLE_ADMIN)
  findAll() {
    return this.settingsService.findAll();
  }

  @Get('admin/settings/:key')
  @Roles(ROLE_ADMIN)
  findByKey(@Param('key') key: string) {
    return this.settingsService.findByKey(key);
  }

  @Put('admin/settings')
  @Roles(ROLE_ADMIN)
  upsert(@Body() dto: UpsertSettingDto) {
    return this.settingsService.upsert(dto);
  }
}
