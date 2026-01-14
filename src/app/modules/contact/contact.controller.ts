import { Request, Response, NextFunction } from 'express';
import { ContactServices } from './contact.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

// create/update contact
const createUpdateContact = catchAsync(async (req: Request, res: Response) => {
  const result = await ContactServices.createUpdateContactToDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Contact created successfully',
    data: result,
  });
});

// get contact
const getContact = catchAsync(async (req: Request, res: Response) => {
  const result = await ContactServices.getContactFromDB();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Contact retrieved successfully',
    data: result,
  });
});

export const ContactController = {
  createUpdateContact,
  getContact,
};
