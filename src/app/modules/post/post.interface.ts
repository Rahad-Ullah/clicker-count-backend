import { Model, Types } from 'mongoose';
import { POST_PRIVACY, POST_STATUS } from './post.constants';

export interface IPost {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  photos: string[];
  description: string;
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  clickerType: string;
  privacy: POST_PRIVACY;
  status: POST_STATUS;
  isDeleted: boolean;
}

export type PostModel = Model<IPost>;
