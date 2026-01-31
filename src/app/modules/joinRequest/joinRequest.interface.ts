import { Model, Types } from 'mongoose';
import { JOIN_REQUEST_STATUS } from './joinRequest.constants';

export interface IJoinRequest {
  _id: Types.ObjectId;
  chat: Types.ObjectId;
  user: Types.ObjectId;
  status: JOIN_REQUEST_STATUS;
}

export type JoinRequestModel = Model<IJoinRequest>;
