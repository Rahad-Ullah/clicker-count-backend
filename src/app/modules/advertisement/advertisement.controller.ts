import { Request, Response, NextFunction } from 'express';
import { AdvertisementServices } from './advertisement.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { getSingleFilePath } from '../../../shared/getFilePath';
import ApiError from '../../../errors/ApiError';

// create advertisement
const createAdvertisement = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  payload.user = req.user.id;
  const imagePath = getSingleFilePath(req.files, 'image');
  if (!imagePath) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Image is required');
  }
  payload.image = imagePath;
  if (payload.longitude && payload.latitude) {
    const lng = parseFloat(payload.longitude);
    const lat = parseFloat(payload.latitude);
    payload.focusAreaLocation = {
      type: 'Point',
      coordinates: [lng, lat],
    };
    delete payload.longitude;
    delete payload.latitude;
  }

  const result = await AdvertisementServices.createAdvertisementIntoDB(payload);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Advertisement created successfully',
    data: result,
  });
});

export const AdvertisementController = {
  createAdvertisement,
};