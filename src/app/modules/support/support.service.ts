import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ISupport } from './support.interface';
import { Support } from './support.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { User } from '../user/user.model';

// ----------- create support -----------
export const createSupport = async (payload: ISupport): Promise<ISupport> => {
  // check if user already submitted more that 3 requests within 24 hours
  const existingRequestCount = await Support.countDocuments({
    user: payload.user,
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  });

  if (existingRequestCount >= 3) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'We are processing a couple of your request. Please try again later.'
    );
  }

  const result = await Support.create(payload);
  return result;
};

// ----------- update support -----------
export const updateSupport = async (
  id: string,
  payload: Partial<ISupport>
): Promise<ISupport> => {
  // check if support exists
  const existingSupport = await Support.exists({ _id: id });
  if (!existingSupport) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Support not found');
  }

  const result = await Support.findByIdAndUpdate(id, payload, { new: true });
  return result!;
};

// ----------- get all support -----------
const getAllSupport = async (query: Record<string, unknown>) => {
  // pre-filter users
  const searchTerm = (query?.searchTerm as string)?.trim();
  const users = searchTerm
    ? await User.find({
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } },
        ],
      })
        .select('_id')
        .lean()
    : [];

  // filter by users
  const supportQuery = new QueryBuilder(
    Support.find({
      user: { $in: users },
    }).populate('user', 'name email image'),
    query
  )
    .filter()
    .paginate()
    .sort()
    .fields();

  const [data, pagination] = await Promise.all([
    supportQuery.modelQuery.lean(),
    supportQuery.getPaginationInfo(),
  ]);

  return { data, pagination };
};

export const SupportServices = {
  createSupport,
  updateSupport,
  getAllSupport,
};
