import { Model, Types } from 'mongoose';
import { FRIEND_REQUEST_STATUS } from './friendRequest.constants';

export interface IFriendRequest {
  _id: Types.ObjectId;
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  status: FRIEND_REQUEST_STATUS;
}

export type FriendRequestModel = Model<IFriendRequest>;
