import { Request, Response } from 'express';
import { AdvertiserServices } from './advertiser.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { getSingleFilePath } from '../../../shared/getFilePath';
import ApiError from '../../../errors/ApiError';

// create advertiser
const createAdvertiser = catchAsync(async (req: Request, res: Response) => {
  const logo = getSingleFilePath(req.files, 'image');
  if (!logo) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Logo image is required');
  }

  const result = await AdvertiserServices.createAdvertiser({
    ...req.body,
    user: req.user.id,
    logo,
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result?.message || 'Advertiser created successfully',
    data: result?.data,
  });
});

// verify advertiser
const verifyAdvertiser = catchAsync(async (req: Request, res: Response) => {
  const result = await AdvertiserServices.verifyAdvertiser(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Advertiser verified successfully',
    data: result,
  });
});

// update advertiser
const updateAdvertiserByUserId = catchAsync(
  async (req: Request, res: Response) => {
    const logo = getSingleFilePath(req.files, 'image');
    if (logo) {
      req.body.logo = logo;
    }
    const result = await AdvertiserServices.updateAdvertiserByUserId(
      req.user.id,
      req.body,
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Advertiser updated successfully',
      data: result,
    });
  },
);

// get advertiser by user id
const getAdvertiserByUserId = catchAsync(async (req: Request, res: Response) => {
  const result = await AdvertiserServices.getAdvertiserByUserId(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Advertiser fetched successfully',
    data: result,
  });
});

// get my advertiser profile
const getMyAdvertiserProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await AdvertiserServices.getAdvertiserByUserId(req.user.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Advertiser fetched successfully',
    data: result,
  });
});

export const AdvertiserController = {
  createAdvertiser,
  verifyAdvertiser,
  updateAdvertiserByUserId,
  getAdvertiserByUserId,
  getMyAdvertiserProfile,
};
