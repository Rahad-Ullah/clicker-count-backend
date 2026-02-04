import { Schema, model } from 'mongoose';
import { ISetting, SettingModel } from './setting.interface';

const settingSchema = new Schema<ISetting, SettingModel>({
  nearbyRange: { type: Number, required: true },
});

export const Setting = model<ISetting, SettingModel>('Setting', settingSchema);
