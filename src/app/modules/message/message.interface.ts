import { Model, ObjectId } from 'mongoose';
import { MESSAGE_TYPE } from './message.constant';

export type IMessage = {
  _id: ObjectId;
  chat: ObjectId;
  sender: ObjectId;
  type: MESSAGE_TYPE;
  content: string;
  seenBy: ObjectId[];
  isDeleted: boolean;
};

export type MessageModel = Model<IMessage>;
