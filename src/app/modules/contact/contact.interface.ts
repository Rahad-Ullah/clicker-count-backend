import { Model, Types } from 'mongoose';

export interface IContact {
  _id: Types.ObjectId;
  email: string;
  phone: string;
  whatsApp: string;
}

export type ContactModel = Model<IContact>;
