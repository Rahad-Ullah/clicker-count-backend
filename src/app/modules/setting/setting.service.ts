import { ISetting } from './setting.interface';
import { Setting } from './setting.model';

// create/update setting
const updateSettingToDB = async (
  payload: Partial<ISetting>,
): Promise<ISetting> => {
  // create or update setting
  const result = await Setting.findOneAndUpdate({}, payload, {
    new: true,
    upsert: true,
  });
  return result;
};

export const SettingServices = {
  updateSettingToDB,
};
