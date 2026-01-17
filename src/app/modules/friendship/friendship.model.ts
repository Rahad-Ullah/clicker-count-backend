import { Schema, model } from 'mongoose';
import { IFriendship, FriendshipModel } from './friendship.interface';

const friendshipSchema = new Schema<IFriendship, FriendshipModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    friend: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

friendshipSchema.index({ user: 1, friend: 1 }, { unique: true });

export const Friendship = model<IFriendship, FriendshipModel>(
  'Friendship',
  friendshipSchema
);
