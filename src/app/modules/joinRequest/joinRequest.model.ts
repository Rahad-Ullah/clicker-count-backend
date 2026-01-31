import { Schema, model } from 'mongoose';
import { IJoinRequest, JoinRequestModel } from './joinRequest.interface';
import { JOIN_REQUEST_STATUS } from './joinRequest.constants';

const joinRequestSchema = new Schema<IJoinRequest>(
  {
    chat: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: Object.values(JOIN_REQUEST_STATUS),
      default: JOIN_REQUEST_STATUS.PENDING,
    },
  },
  {
    timestamps: true,
  },
);

export const JoinRequest = model<IJoinRequest, JoinRequestModel>(
  'JoinRequest',
  joinRequestSchema,
);
