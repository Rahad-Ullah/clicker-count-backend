import { Schema, model } from 'mongoose';
import { IMessage, MessageModel } from './message.interface';
import { MESSAGE_TYPE } from './message.constant';

const messageSchema = new Schema<IMessage, MessageModel>(
  {
    chat: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Chat',
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(MESSAGE_TYPE),
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    seenBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ chat: 1, sender: 1 });
messageSchema.index({ chat: 1, seenBy: 1 });

export const Message = model<IMessage, MessageModel>('Message', messageSchema);
