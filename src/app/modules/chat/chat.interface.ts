import { Model, Types } from 'mongoose';
import {
  CHAT_ACCESS_TYPE,
  CHAT_PRIVACY,
  CHAT_STATUS,
  REQUEST_STATUS,
} from './chat.constant';

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
  requestStatus: REQUEST_STATUS;
  latestMessage: Types.ObjectId;
  status: CHAT_STATUS;
  isDeleted: boolean;
};

export type ChatModel = Model<IChat>;
