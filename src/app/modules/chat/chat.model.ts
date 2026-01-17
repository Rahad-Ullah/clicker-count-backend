import { Schema, model } from 'mongoose';
import { IChat, ChatModel } from './chat.interface';
import { CHAT_ACCESS_TYPE, CHAT_PRIVACY } from './chat.constant';

const chatSchema = new Schema<IChat, ChatModel>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    chatName: { type: String, default: '' },
    description: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    isGroupChat: { type: Boolean, default: false },
    privacy: {
      type: String,
      enum: Object.values(CHAT_PRIVACY),
      default: CHAT_PRIVACY.PRIVATE,
    },
    accessType: {
      type: String,
      enum: Object.values(CHAT_ACCESS_TYPE),
      default: CHAT_ACCESS_TYPE.OPEN,
    },
    latestMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

chatSchema.index({ participants: 1, updatedAt: -1 });

export const Chat = model<IChat, ChatModel>('Chat', chatSchema);
