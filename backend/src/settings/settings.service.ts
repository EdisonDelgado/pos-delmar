import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Setting } from '../database/models/setting.model';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class SettingsService {
  constructor(@InjectModel(Setting) private settingModel: typeof Setting) {}

  async create(createSettingDto: CreateSettingDto): Promise<Setting> {
    const existing = await this.settingModel.findOne({ where: { key: createSettingDto.key } });
    if (existing) throw new ConflictException(`Setting with key "${createSettingDto.key}" already exists`);
    return this.settingModel.create(createSettingDto);
  }

  async findAll(): Promise<Setting[]> {
    return this.settingModel.findAll({ order: [['key', 'ASC']] });
  }

  async findOne(id: number): Promise<Setting> {
    const setting = await this.settingModel.findByPk(id);
    if (!setting) throw new NotFoundException(`Setting with ID ${id} not found`);
    return setting;
  }

  async findByKey(key: string): Promise<Setting> {
    const setting = await this.settingModel.findOne({ where: { key } });
    if (!setting) throw new NotFoundException(`Setting with key "${key}" not found`);
    return setting;
  }

  async update(id: number, updateSettingDto: UpdateSettingDto): Promise<Setting> {
    const setting = await this.findOne(id);
    return setting.update(updateSettingDto);
  }

  async remove(id: number): Promise<void> {
    const setting = await this.findOne(id);
    await setting.destroy();
  }
}
