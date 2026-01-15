import { Schema, model } from 'mongoose';
import { IPost, PostModel } from './post.interface';
import { POST_PRIVACY, POST_STATUS } from './post.constants';

const postSchema = new Schema<IPost, PostModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      required: true,
    },
    photos: { type: [String], default: [] },
    description: { type: String, required: true },
    address: { type: String, required: true },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    clickerType: { type: String, required: true },
    privacy: {
      type: String,
      enum: Object.values(POST_PRIVACY),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(POST_STATUS),
      default: POST_STATUS.ACTIVE,
    },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Geospatial index for location queries
postSchema.index({ location: '2dsphere' });

export const Post = model<IPost, PostModel>('Post', postSchema);
