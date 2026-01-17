import { Types } from 'mongoose';
import ApiError from '../errors/ApiError';
import { StatusCodes } from 'http-status-codes';

export const toObjectId = (id: unknown) => {
  if (!Types.ObjectId.isValid(id as string)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid user id');
  }
  return new Types.ObjectId(id as string);
};
