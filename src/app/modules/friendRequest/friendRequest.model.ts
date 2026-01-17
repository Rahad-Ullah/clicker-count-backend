import { Schema, model } from 'mongoose';
import { IFriendRequest, FriendRequestModel } from './friendRequest.interface';
import { FRIEND_REQUEST_STATUS } from './friendRequest.constants';

const friendRequestSchema = new Schema<IFriendRequest, FriendRequestModel>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(FRIEND_REQUEST_STATUS),
      default: FRIEND_REQUEST_STATUS.PENDING,
    },
  },
  {
    timestamps: true,
  }
);

friendRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });

export const FriendRequest = model<IFriendRequest, FriendRequestModel>(
  'FriendRequest',
  friendRequestSchema
);
