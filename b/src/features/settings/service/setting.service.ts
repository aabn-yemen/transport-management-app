import { Setting, ISetting } from '../model/setting.model';

export class SettingService {
  async get() {
    const settings = await Setting.findOne();
    if (!settings) {
      return Setting.create({});
    }
    return settings;
  }

  async update(data: Partial<ISetting>) {
    const settings = await this.get();
    Object.assign(settings, data);
    await settings.save();
    return settings;
  }
}

export const settingService = new SettingService();
