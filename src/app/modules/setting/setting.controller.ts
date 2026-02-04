import { Request, Response, NextFunction } from 'express';
import { SettingServices } from './setting.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';

// create/update setting
const updateSetting = catchAsync(async (req: Request, res: Response) => {
  const result = await SettingServices.updateSettingToDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Setting updated successfully',
    data: result,
  });
});

export const SettingController = {
  updateSetting,
};
