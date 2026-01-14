import bcrypt from 'bcrypt';
import { model, Schema } from 'mongoose';
import config from '../../../config';
import { IUser, UserModal } from './user.interface';
import { GENDER, USER_PRIVACY, USER_ROLES, USER_STATUS } from './user.constant';

const userSchema = new Schema<IUser, UserModal>(
  {
    name: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      minlength: 8,
      select: 0,
    },
    image: {
      type: String,
      default: '',
    },
    gender: {
      type: String,
      enum: GENDER,
      default: null,
    },
    dob: {
      type: Date,
      default: null,
    },
    bio: {
      type: String,
      default: '',
    },
    privacy: {
      type: String,
      enum: USER_PRIVACY,
      default: USER_PRIVACY.PUBLIC,
    },
    address: {
      type: String,
      default: '',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    advertiser: {
      type: Schema.Types.ObjectId,
      ref: 'Advertiser',
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    authentication: {
      type: {
        isResetPassword: {
          type: Boolean,
          default: false,
        },
        oneTimeCode: {
          type: Number,
          default: null,
        },
        expireAt: {
          type: Date,
          default: null,
        },
      },
      select: 0,
    },
  },
  { timestamps: true }
);

// Index for geospatial queries
userSchema.index({ location: '2dsphere' });

//exist user check
userSchema.statics.isExistUserById = async (id: string) => {
  const isExist = await User.findById(id);
  return isExist;
};

userSchema.statics.isExistUserByEmail = async (email: string) => {
  const isExist = await User.findOne({ email });
  return isExist;
};

//is match password
userSchema.statics.isMatchPassword = async (
  password: string,
  hashPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashPassword);
};

userSchema.pre('save', async function (next) {
  // check if password not exist or password not modified in this call
  if (!this.password) return next();
  if (!this.isModified('password')) return next();
  //password hash
  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcrypt_salt_rounds)
  );
  next();
});

export const User = model<IUser, UserModal>('User', userSchema);
