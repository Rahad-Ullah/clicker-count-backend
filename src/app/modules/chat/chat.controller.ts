import { Request, Response, NextFunction } from 'express';
import { ChatServices } from './chat.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

// create 1-to-1 chat
const create1To1Chat = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await ChatServices.create1To1ChatIntoDB({
      ...req.body,
      author: req.user.id,
    });

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Chat created successfully',
      data: result,
    });
  }
);

// create group chat
const createGroupChat = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await ChatServices.createGroupChatIntoDB({
      ...req.body,
      author: req.user.id,
    });

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Chat created successfully',
      data: result,
    });
  }
);

// delete chat
const deleteChat = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await ChatServices.deleteChatFromDB(req.params.id);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: 'Chat created successfully',
      data: result,
    });
  }
);

// get single chat
const getSingleChat = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await ChatServices.getSingleChatFromDB(req.params.id, req.user.id);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: 'Chat retrieved successfully',
      data: result,
    });
  }
);

// getMy chat
const getMyChats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await ChatServices.getMyChatsFromDB(req.user, req.query);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: 'Chats retrieved successfully',
      data: result,
    });
  }
);

export const ChatController = {
  create1To1Chat,
  createGroupChat,
  deleteChat,
  getSingleChat,
  getMyChats,
};
