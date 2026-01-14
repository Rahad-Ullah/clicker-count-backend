import { Request, Response, NextFunction } from 'express';
import { SupportServices } from './support.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

// create support
const createSupport = catchAsync(async (req: Request, res: Response) => {
  const result = await SupportServices.createSupport({
    ...req.body,
    user: req.user?.id,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Support created successfully',
    data: result,
  });
});

// update support
const updateSupport = catchAsync(async (req: Request, res: Response) => {
  const result = await SupportServices.updateSupport(req.params.id, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Support updated successfully',
    data: result,
  });
});

// get all support
const getAllSupport = catchAsync(async (req: Request, res: Response) => {
  const result = await SupportServices.getAllSupport(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Support retrieved successfully',
    data: result.data,
    pagination: result.pagination,
  });
});

export const SupportController = {
  createSupport,
  updateSupport,
  getAllSupport,
};