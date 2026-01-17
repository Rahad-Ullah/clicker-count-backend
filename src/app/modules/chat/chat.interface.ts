import { Model, Types } from 'mongoose';
import { CHAT_ACCESS_TYPE, CHAT_PRIVACY } from './chat.constant';

export type IChat = {
  _id?: Types.ObjectId;
  participants: Types.ObjectId[];
  author: Types.ObjectId;
  chatName?: string;
  description?: string;
  avatarUrl?: string;
  isGroupChat: boolean;
  privacy: CHAT_PRIVACY;
  accessType: CHAT_ACCESS_TYPE;
  latestMessage: Types.ObjectId;
  isDeleted: boolean;
};

export type ChatModel = Model<IChat>;
