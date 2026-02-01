import { Schema, model } from 'mongoose';
import { ISupport, SupportModel } from './support.interface';
import { SupportStatus } from './support.constants';

const supportSchema = new Schema<ISupport, SupportModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    attachments: [{ type: String, default: [] }],
    status: {
      type: String,
      enum: Object.values(SupportStatus),
      default: SupportStatus.Pending,
    },
  },
  { timestamps: true },
);

export const Support = model<ISupport, SupportModel>('Support', supportSchema);
