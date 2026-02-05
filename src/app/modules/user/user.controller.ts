import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { getSingleFilePath } from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';

// create user
const createUser = catchAsync(async (req: Request, res: Response) => {
  const { ...userData } = req.body;
  const result = await UserService.createUserToDB(userData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User created successfully',
    data: result,
  });
});

//update profile
const updateProfile = catchAsync(async (req: Request, res: Response) => {
  let image = getSingleFilePath(req.files, 'image');

  const payload = {
    image,
    ...req.body,
  };

  // update location in the payload
  if (req.body.location) {
    const [longitude, latitude] = req.body.location;
    payload.location = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };
  }

  const result = await UserService.updateProfileToDB(req.user.id, payload);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile updated successfully',
    data: result,
  });
});

// toggle user status
const toggleUserStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.toggleUserStatus(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User status updated successfully',
    data: result,
  });
});

// delete user account
const deleteUserAccount = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.deleteAccountFromDB(req.user.id);

  if(result){
    res.clearCookie('accessToken');
  }

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User deleted successfully',
    data: result,
  });
});

// get profile
const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getUserProfileFromDB(req.user.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});

// get single user by id
const getUserById = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getSingleUserFromDB(
    req.params.id,
    req.user.id,
    req.query,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User data retrieved successfully',
    data: result,
  });
});

// get all users
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsersFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Users data retrieved successfully',
    data: result.result,
    pagination: result.pagination,
  });
});

export const UserController = {
  createUser,
  updateProfile,
  toggleUserStatus,
  deleteUserAccount,
  getUserProfile,
  getUserById,
  getAllUsers,
};
