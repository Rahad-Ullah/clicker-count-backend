import { StatusCodes } from 'http-status-codes';
import { User } from '../user/user.model';
import { IAdvertiser } from './advertiser.interface';
import { Advertiser } from './advertiser.model';
import ApiError from '../../../errors/ApiError';
import { USER_ROLES } from '../user/user.constant';
import generateOTP from '../../../util/generateOTP';
import mongoose from 'mongoose';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import { jwtHelper } from '../../../helpers/jwtHelper';
import config from '../../../config';
import { Secret } from 'jsonwebtoken';
import unlinkFile from '../../../shared/unlinkFile';
import QueryBuilder from '../../builder/QueryBuilder';

// ---------------- create advertiser ----------------
const createAdvertiser = async (payload: IAdvertiser) => {
  const session = await mongoose.startSession();
  let otp: number;
  let user;

  try {
    session.startTransaction();

    user = await User.findById(payload.user).session(session);
    if (!user) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'User does not exist');
    }

    const existingAdvertiser = await Advertiser.findOne({
      user: payload.user,
    }).session(session);

    if (existingAdvertiser) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'You are already an advertiser',
      );
    }

    const advertiser = await Advertiser.create([payload], { session });
    const createdAdvertiser = advertiser[0];

    otp = generateOTP(6);

    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id, role: USER_ROLES.USER },
      {
        $set: {
          role: USER_ROLES.ADVERTISER,
          advertiser: createdAdvertiser._id,
          authentication: {
            oneTimeCode: otp,
            expireAt: new Date(Date.now() + 5 * 60 * 1000),
          },
        },
      },
      { session },
    );

    if (!updatedUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'User role update failed');
    }

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  // if user has email, send otp
  if (user.email) {
    const template = emailTemplate.createAccount({
      name: user.name || 'there',
      email: user.email,
      otp,
    });

    await emailHelper.sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
    });

    return {
      data: null,
      message:
        'Advertiser created successfully. Please check your email for verification',
    };
  }

  // if user doesn't have email, return access token
  const accessToken = jwtHelper.createToken(
    {
      id: user._id,
      role: USER_ROLES.ADVERTISER,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as string,
  );

  return {
    data: { accessToken },
    message: 'Account created successfully',
  };
};

// ---------------- verify advertiser ----------------
const verifyAdvertiser = async (payload: {
  email: string;
  oneTimeCode: number;
}) => {
  const { email, oneTimeCode } = payload;
  const user = await User.findOne({ email }).select('+authentication');
  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (!oneTimeCode) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please give the otp, check your email we send a code',
    );
  }

  if (user.authentication?.oneTimeCode !== oneTimeCode) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You provided wrong otp');
  }

  const date = new Date();
  if (date > user.authentication?.expireAt) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Otp already expired, Please try again',
    );
  }

  const updatedUser = await User.findOneAndUpdate(
    { _id: user._id },
    {
      isVerified: true,
      authentication: { oneTimeCode: null, expireAt: null },
    },
    { new: true },
  ).populate('advertiser');

  //create access token
  const accessToken = jwtHelper.createToken(
    { id: user._id, role: user.role, email: user.email },
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as string,
  );

  return { accessToken, role: user.role, user: updatedUser };
};

// ---------------- update by user id ----------------
const updateAdvertiserByUserId = async (
  userId: string,
  payload: IAdvertiser,
) => {
  // check if advertiser exists
  const advertiser = await Advertiser.findOne({ user: userId });
  if (!advertiser) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'You are not an advertiser');
  }

  const result = await Advertiser.findByIdAndUpdate(advertiser._id, payload, {
    new: true,
  });

  // unlink old logo
  if (payload.logo && advertiser.logo && result) {
    await unlinkFile(advertiser.logo);
  }

  return result;
};

// ---------------- get advertiser by user id ---------------
const getAdvertiserByUserId = async (userId: string) => {
  const result = await Advertiser.findOne({ user: userId }).populate(
    'user',
    'name email image gender dob bio address location',
  );

  return result;
};

// ---------------- get all advertisers ----------------
const getAllAdvertisers = async (query: Record<string, unknown>) => {
  const advertiserQuery = new QueryBuilder(
    Advertiser.find({}).populate(
      'user',
      'name email image gender dob bio address location',
    ),
    query,
  )
    .search(['businessName', 'businessType', 'phone'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const [data, pagination] = await Promise.all([
    advertiserQuery.modelQuery.lean(),
    advertiserQuery.getPaginationInfo(),
  ]);

  return { data, pagination };
};

export const AdvertiserServices = {
  createAdvertiser,
  verifyAdvertiser,
  updateAdvertiserByUserId,
  getAdvertiserByUserId,
  getAllAdvertisers,
};
