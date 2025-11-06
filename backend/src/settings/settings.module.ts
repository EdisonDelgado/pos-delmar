import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { Setting } from '../database/models/setting.model';

@Module({
  imports: [SequelizeModule.forFeature([Setting])],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
