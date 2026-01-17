import { Request, Response, NextFunction } from 'express';
import { MessageServices } from './message.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { getSingleFilePath } from '../../../shared/getFilePath';

// ----------------- create message -------------------
const createMessage = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const image = getSingleFilePath(req.files, 'image');
    const payload = { ...req.body, image, sender: req.user.id };
    const result = await MessageServices.createMessage(payload);

    sendResponse(res, {
      success: true,
      statusCode: 201,
      message: 'Message created successfully',
      data: result,
    });
  }
);

// ----------------- get messages by chat id -------------------
const getChatMessages = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const chatId = req.params.chatId;
    const user = req.user;

    const result = await MessageServices.getChatMessages(
      chatId,
      req.query,
      user
    );

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: 'Messages retrieved successfully',
      data: result.messages,
      pagination: result.pagination,
    });
  }
);

export const MessageController = { createMessage, getChatMessages };
