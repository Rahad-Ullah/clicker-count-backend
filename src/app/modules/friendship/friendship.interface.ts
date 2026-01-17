import { Model, Types } from 'mongoose';

export interface IFriendship {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  friend: Types.ObjectId;
}

export type FriendshipModel = Model<IFriendship>;
