import { Model, Types } from 'mongoose';

export interface IAdvertiser {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  businessName: string;
  businessType: string;
  logo: string;
  licenseNumber: string;
  phone: string;
  bio: string;
  isDeleted: boolean;
}

export type AdvertiserModel = Model<IAdvertiser>;
