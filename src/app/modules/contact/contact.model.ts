import { Schema, model } from 'mongoose';
import { IContact, ContactModel } from './contact.interface';

const contactSchema = new Schema<IContact, ContactModel>(
  {
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    whatsApp: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Contact = model<IContact, ContactModel>('Contact', contactSchema);
