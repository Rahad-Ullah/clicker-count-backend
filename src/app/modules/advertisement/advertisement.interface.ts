import { Model, Types } from 'mongoose';
import { AD_STATUS, PAYMENT_STATUS } from './advertisement.constants';

// Location schema type
export interface ILocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

// Advertisement interface
export interface IAdvertisement {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  advertiser: Types.ObjectId;
  title: string;
  description: string;
  image: string;
  focusArea: string;
  focusAreaLocation: ILocation;
  websiteUrl: string;
  startAt: Date;
  endAt: Date;
  plan: Types.ObjectId;
  price: number;
  paymentStatus: PAYMENT_STATUS;
  paidAt?: Date;
  reachCount: number;
  clickCount: number;
  status: AD_STATUS;
  isDeleted: boolean;
}

export type AdvertisementModel = Model<IAdvertisement>;
