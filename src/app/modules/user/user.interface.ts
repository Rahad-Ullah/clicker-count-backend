import { Model, Types } from 'mongoose';
import { GENDER, USER_PRIVACY, USER_ROLES, USER_STATUS } from './user.constant';

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: USER_ROLES;
  image: string;
  gender: GENDER;
  dob: Date;
  bio: string;
  privacy: USER_PRIVACY;
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  advertiser: Types.ObjectId;
  status: USER_STATUS;
  isOnline: boolean;
  isVerified: boolean;
  isDeleted: boolean;
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
}

export type UserModal = {
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;
