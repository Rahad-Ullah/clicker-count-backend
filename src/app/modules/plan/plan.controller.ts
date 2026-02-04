import { Request, Response } from 'express';
import { PlanServices } from './plan.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

// create plan
const createPlan = catchAsync(async (req: Request, res: Response) => {
  const result = await PlanServices.createPlanIntoDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Plan created successfully',
    data: result,
  });
});

// delete plan
const deletePlan = catchAsync(async (req: Request, res: Response) => {
  const result = await PlanServices.deletePlanFromDB(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Plan deleted successfully',
    data: result,
  });
});

export const PlanController = {
  createPlan,
  deletePlan,
};
