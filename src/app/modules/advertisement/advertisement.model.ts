import { Schema, model } from 'mongoose';
import { IAdvertisement, AdvertisementModel } from './advertisement.interface';
import { AD_STATUS, PAYMENT_STATUS } from './advertisement.constants';

const LocationSchema = new Schema(
  {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: (coords: number[]) =>
          coords.length === 2 &&
          coords[0] >= -180 &&
          coords[0] <= 180 &&
          coords[1] >= -90 &&
          coords[1] <= 90,
        message: 'Coordinates must be valid longitude/latitude values',
      },
    },
  },
  { _id: false },
);

const advertisementSchema = new Schema<IAdvertisement, AdvertisementModel>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    advertiser: {
      type: Schema.Types.ObjectId,
      ref: 'Advertiser',
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    focusArea: { type: String, required: true },
    focusAreaLocation: { type: LocationSchema, required: true },
    websiteUrl: { type: String, required: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    price: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.Unpaid,
    },
    paidAt: { type: Date, default: null },
    reachCount: { type: Number, default: 0 },
    clickCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: Object.values(AD_STATUS),
      default: AD_STATUS.Pending,
    },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

export const Advertisement = model<IAdvertisement, AdvertisementModel>(
  'Advertisement',
  advertisementSchema,
);
