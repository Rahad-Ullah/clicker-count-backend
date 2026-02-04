import { Request, Response, NextFunction } from 'express';
import { AdvertisementServices } from './advertisement.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { getSingleFilePath } from '../../../shared/getFilePath';

// create advertisement
const createAdvertisement = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const imagePath = getSingleFilePath(req.files, 'image');
  if (imagePath) {
    payload.image = imagePath;
  }
  if (payload.focusAreaLocation) {
    const [lng, lat] = payload.focusAreaLocation;
    payload.focusAreaLocation = {
      type: 'Point',
      coordinates: [lng, lat],
    };
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