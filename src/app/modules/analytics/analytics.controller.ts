import { Request, Response } from 'express';
import { AnalyticsServices } from './analytics.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

// get overview
const getOverview = catchAsync(async (req: Request, res: Response) => {
  const result = await AnalyticsServices.getOverview();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Overview retrieved successfully',
    data: result,
  });
});

// get monthly user growth
const getMonthlyUserGrowth = catchAsync(async (req: Request, res: Response) => {
  const result = await AnalyticsServices.getMonthlyUserGrowth(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Monthly user growth retrieved successfully',
    data: result,
  });
});

// get monthly earnings growth
const getEarningGrowth = catchAsync(async (req: Request, res: Response) => {
  const result = await AnalyticsServices.getEarningGrowth(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Earning growth retrieved successfully',
    data: result,
  });
});

export const AnalyticsController = {
  getOverview,
  getMonthlyUserGrowth,
  getEarningGrowth,
};
