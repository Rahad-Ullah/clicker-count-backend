import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import unlinkFile from '../../../shared/unlinkFile';
import generateOTP from '../../../util/generateOTP';
import { IUser } from './user.interface';
import { User } from './user.model';
import { USER_ROLES, USER_STATUS } from './user.constant';
import QueryBuilder from '../../builder/QueryBuilder';

const createUserToDB = async (payload: Partial<IUser>) => {
  //set role
  payload.role = USER_ROLES.USER;
  const createUser = await User.create(payload);
  if (!createUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }

  //send email
  const otp = generateOTP(6);
  const values = {
    name: createUser.name,
    otp: otp,
    email: createUser.email!,
  };
  const createAccountTemplate = emailTemplate.createAccount(values);
  emailHelper.sendEmail(createAccountTemplate);

  //save to DB
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes expiration
  };
  await User.findOneAndUpdate(
    { _id: createUser._id },
    { $set: { authentication } }
  );

  return 'We have sent you an email with a one-time code to verify your account. Please check your email.';
};

const updateProfileToDB = async (
  id: string,
  payload: Partial<IUser>
): Promise<Partial<IUser | null>> => {
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //unlink file here
  if (payload.image && isExistUser.image) {
    unlinkFile(isExistUser.image);
  }

  const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return updateDoc;
};

// toggle user status
const toggleUserStatus = async (id: string) => {
  const isExistUser = await User.findById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  const result = await User.findByIdAndUpdate(
    id,
    [
      {
        $set: {
          status:
            isExistUser.status === USER_STATUS.ACTIVE
              ? USER_STATUS.INACTIVE
              : USER_STATUS.ACTIVE,
        },
      },
    ],
    { new: true }
  );
  return result;
};

//get single user by id
const getSingleUserFromDB = async (id: string): Promise<Partial<IUser>> => {
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return isExistUser;
};

// get all users
const getAllUsersFromDB = async (query: Record<string, unknown>) => {
  const userQuery = new QueryBuilder(
    User.find({ isDeleted: false, role: { $ne: USER_ROLES.SUPER_ADMIN } }),
    query
  )
    .search(['name', 'email'])
    .filter()
    .sort()
    .fields()
    .paginate();

  const [result, pagination] = await Promise.all([
    userQuery.modelQuery.lean(),
    userQuery.getPaginationInfo(),
  ]);

  return { result, pagination };
};

export const UserService = {
  createUserToDB,
  updateProfileToDB,
  toggleUserStatus,
  getSingleUserFromDB,
  getAllUsersFromDB,
};
