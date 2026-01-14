import { Request, Response } from 'express';
import { DisclaimerServices } from './disclaimer.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

// create/update disclaimer
const createUpdateDisclaimer = catchAsync(
  async (req: Request, res: Response) => {
    const result = await DisclaimerServices.createUpdateDisclaimerToDB(
      req.body
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Disclaimer created successfully',
      data: result,
    });
  }
);

// get single disclaimer by type
const getSingleDisclaimerByType = catchAsync(
  async (req: Request, res: Response) => {
    const result = await DisclaimerServices.getSingleDisclaimerByType(
      req.params.type
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Disclaimer retrieved successfully',
      data: result,
    });
  }
);

export const DisclaimerController = {
  createUpdateDisclaimer,
  getSingleDisclaimerByType,
};
