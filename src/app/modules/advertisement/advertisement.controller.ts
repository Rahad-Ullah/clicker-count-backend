import { Request, Response, NextFunction } from 'express';
import { AdvertisementServices } from './advertisement.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { getSingleFilePath } from '../../../shared/getFilePath';
import ApiError from '../../../errors/ApiError';
import { redis } from '../../../config/redis';

// create advertisement
const createAdvertisement = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  payload.user = req.user.id;
  const imagePath = getSingleFilePath(req.files, 'image');
  // if (!imagePath) {
  //   throw new ApiError(StatusCodes.BAD_REQUEST, 'Image is required');
  // }
  payload.image = imagePath || '';
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

// update advertisement
const updateAdvertisement = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const imagePath = getSingleFilePath(req.files, 'image');
  if (imagePath) {
    payload.image = imagePath;
  }
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

  const result = await AdvertisementServices.updateAdvertisementIntoDB(
    req.params.id,
    payload,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Advertisement updated successfully',
    data: result,
  });
});

// update advertisement approval status
const updateAdvertisementStatus = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AdvertisementServices.updateAdvertisementStatus(
      req.params.id,
      req.body,
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Advertisement status updated successfully',
      data: result,
    });
  },
);

// delete advertisement
const deleteAdvertisement = catchAsync(async (req: Request, res: Response) => {
  const result = await AdvertisementServices.deleteAdvertisementFromDB(
    req.params.id,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Advertisement deleted successfully',
    data: result,
  });
});

// get my advertisements
const getMyAdvertisements = catchAsync(async (req: Request, res: Response) => {
  const result = await AdvertisementServices.getAdvertisementsByUserId(
    req.user.id,
    req.query,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'My advertisements fetched successfully',
    data: result.data,
    pagination: result.pagination,
  });
});

// get single advertisement by id
const getSingleAdvertisementById = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AdvertisementServices.getAdvertisementById(
      req.params.id,
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Single advertisement fetched successfully',
      data: result,
    });
  },
);

// get all advertisements
const getAllAdvertisements = catchAsync(async (req: Request, res: Response) => {
  const result = await AdvertisementServices.getAllAdvertisements(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Advertisements fetched successfully',
    data: result.data,
    pagination: result.pagination,
  });
});

// get nearby active ads
const getNearbyActiveAds = catchAsync(async (req: Request, res: Response) => {
  const result = await AdvertisementServices.getActiveAdvertisements(req.query);
  // Use device id as the unique identifier for public reach
  const deviceId = req.query.deviceId as string;

  // Track reach count
  if (result.length > 0) {
    const pipeline = redis.pipeline();
    for (const ad of result) {
      const key = `advertisement:reach:${ad._id}`;
      pipeline.sadd(key, deviceId);
      pipeline.expire(key, 60 * 60 * 24 * 30); // ttl: 30 day
    }
    await pipeline.exec();
  }

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Nearby active advertisements fetched successfully',
    data: result,
  });
});

// track ad click
const trackAdClick = catchAsync(async (req: Request, res: Response) => {
  const key = `advertisement:clicks:${req.params.id}`;
  await redis.incr(key);
  await redis.expire(key, 60 * 60 * 24); // ttl: 24 hours

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Ad click tracked'
  });
});

// get my advertisement overview
const getMyAdvertisementOverview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await AdvertisementServices.getAdvertiserOverview(
      req.user.id,
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'My advertisement overview fetched successfully',
      data: result,
    });
  },
);

export const AdvertisementController = {
  createAdvertisement,
  updateAdvertisement,
  updateAdvertisementStatus,
  deleteAdvertisement,
  getMyAdvertisements,
  getSingleAdvertisementById,
  getAllAdvertisements,
  getNearbyActiveAds,
  trackAdClick,
  getMyAdvertisementOverview,
};
