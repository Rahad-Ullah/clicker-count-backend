import { Schema, model } from 'mongoose';
import { IAdvertiser, AdvertiserModel } from './advertiser.interface';

const advertiserSchema = new Schema<IAdvertiser, AdvertiserModel>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    businessName: { type: String, required: true },
    businessType: { type: String, required: true },
    logo: { type: String, required: true },
    licenseNumber: { type: String, required: true },
    phone: { type: String, required: true },
    bio: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

export const Advertiser = model<IAdvertiser, AdvertiserModel>(
  'Advertiser',
  advertiserSchema,
);
