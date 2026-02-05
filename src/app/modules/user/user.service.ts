import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import unlinkFile from '../../../shared/unlinkFile';
import generateOTP from '../../../util/generateOTP';
import { IUser } from './user.interface';
import { User } from './user.model';
import { USER_ROLES, USER_STATUS } from './user.constant';
import QueryBuilder from '../../builder/QueryBuilder';
import { calculateDistance } from '../../../util/calculateDistance';
import { FriendshipServices } from '../friendship/friendship.service';

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
    { $set: { authentication } },
  );

  return 'We have sent you an email with a one-time code to verify your account. Please check your email.';
};

const updateProfileToDB = async (
  id: string,
  payload: Partial<IUser>,
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
    { new: true },
  );
  return result;
};

// delete user account by id
const deleteAccountFromDB = async (id: string) => {
  const isExistUser = await User.exists({ _id: id });
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  const result = await User.findByIdAndUpdate(
    id,
    {
      $set: {
        isDeleted: true,
      },
    },
    { new: true },
  );
  return result;
};

// get user profile
const getUserProfileFromDB = async (userId: string) => {
  const isExistUser = await User.findById(userId);
  if (!isExistUser || isExistUser.isDeleted) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  if (isExistUser.status !== USER_STATUS.ACTIVE) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Your account is inactive or disabled.',
    );
  }

  return isExistUser;
};

//get single user by id
const getSingleUserFromDB = async (
  id: string,
  currentUserId: string,
  query: Record<string, unknown>,
): Promise<Partial<IUser>> => {
  const result = await User.findById(id).lean();
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // calculate and attach distance from me
  if (
    query.lat &&
    query.lng &&
    result.location.coordinates &&
    result.isLocationVisible
  ) {
    const lat = parseFloat(query.lat as string);
    const lng = parseFloat(query.lng as string);
    const distance = calculateDistance(
      lat,
      lng,
      result.location.coordinates[1],
      result.location.coordinates[0],
    );

    (result as any).distance = distance;
  }

  const friendshipStatus = await FriendshipServices.checkFriendship(
    currentUserId,
    id,
  );

  return {
    ...result,
    ...friendshipStatus,
  };
};

// get all users
const getAllUsersFromDB = async (query: Record<string, unknown>) => {
  const filter: Record<string, any> = {
    isDeleted: false,
    role: { $ne: USER_ROLES.SUPER_ADMIN },
  };
  // Nearby search (lat, lng, radius)
  if (query.lat && query.lng) {
    const lat = parseFloat(query.lat as string);
    const lng = parseFloat(query.lng as string);
    const radiusKm = parseFloat((query.radius as string) || '5'); // radius in kilometers, default to 5km

    if (!isNaN(lat) && !isNaN(lng) && !isNaN(radiusKm) && radiusKm > 0) {
      const EARTH_RADIUS_KM = 6378.1;
      const radiusInRadians = radiusKm / EARTH_RADIUS_KM;

      filter.location = {
        $geoWithin: {
          $centerSphere: [[lng, lat], radiusInRadians],
        },
      };
    }
  }

  const userQuery = new QueryBuilder(
    User.find(filter).populate('advertiser').lean(),
    query,
  )
    .search(['name', 'email'])
    .filter(['location', 'lat', 'lng', 'radius'])
    .sort()
    .fields()
    .paginate();

  const [result, pagination] = await Promise.all([
    userQuery.modelQuery.lean(),
    userQuery.getPaginationInfo(),
  ]);

  // calculate and attach distance from me
  if (query.lat && query.lng) {
    const lat = parseFloat(query.lat as string);
    const lng = parseFloat(query.lng as string);
    result.forEach((user: any) => {
      if (user.location.coordinates) {
        user.distance = calculateDistance(
          lat,
          lng,
          user.location.coordinates[1],
          user.location.coordinates[0],
        );
      }
    });
  }

  return { result, pagination };
};

export const UserService = {
  createUserToDB,
  updateProfileToDB,
  toggleUserStatus,
  deleteAccountFromDB,
  getUserProfileFromDB,
  getSingleUserFromDB,
  getAllUsersFromDB,
};
