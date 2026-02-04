import { ISetting } from './setting.interface';
import { Setting } from './setting.model';

// create/update setting
const updateSettingToDB = async (
  payload: Partial<ISetting>,
): Promise<ISetting> => {
  // ------------ create or update setting ------------
  const result = await Setting.findOneAndUpdate({}, payload, {
    new: true,
    upsert: true,
  });
  return result;
};

// ------------ get setting ------------
const getSettingFromDB = async () => {
  const result = await Setting.findOne({});
  return result;
};

export const SettingServices = {
  updateSettingToDB,
  getSettingFromDB,
};
