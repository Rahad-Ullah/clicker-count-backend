import { Model, Types } from 'mongoose';
import { SupportStatus } from './support.constants';

export interface ISupport {
  _id: string;
  user: Types.ObjectId;
  title: string;
  message: string;
  attachments: string[];
  status: SupportStatus;
}

export type SupportModel = Model<ISupport>;
