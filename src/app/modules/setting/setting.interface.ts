import { Model, Types } from 'mongoose';

export type ISetting = {
  _id: Types.ObjectId;
  nearbyRange: number;
};

export type SettingModel = Model<ISetting>;
