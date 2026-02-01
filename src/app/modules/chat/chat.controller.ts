import { Request, Response, NextFunction } from 'express';
import { ChatServices } from './chat.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { getSingleFilePath } from '../../../shared/getFilePath';

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
  },
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
  },
);

// update chat
const updateChat = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const imagePath = getSingleFilePath(req.files, 'image');
  if (imagePath) {
    payload.avatarUrl = imagePath;
  }
  const result = await ChatServices.updateChatIntoDB(req.params.id, payload);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Chat created successfully',
    data: result,
  });
});

// add member to chat
const addMemberToChat = catchAsync(async (req: Request, res: Response) => {
  const result = await ChatServices.addMemberToChatIntoDB(
    req.params.id,
    req.body.members,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Chat created successfully',
    data: result,
  });
});

// join chat
const joinChat = catchAsync(async (req: Request, res: Response) => {
  const result = await ChatServices.joinChatIntoDB(req.params.id, req.user.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: (result as any)?.message || 'Chat created successfully',
    data: result,
  });
});

// leave chat
const leaveChat = catchAsync(async (req: Request, res: Response) => {
  const result = await ChatServices.leaveChatFromDB(req.params.id, req.user.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Chat created successfully',
    data: result,
  });
});

// delete chat
const deleteChat = catchAsync(async (req: Request, res: Response) => {
  const result = await ChatServices.deleteChatFromDB(req.params.id, req.user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Chat created successfully',
    data: result,
  });
});

// get single chat
const getSingleChat = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await ChatServices.getSingleChatFromDB(
      req.params.id,
      req.user.id,
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Chat retrieved successfully',
      data: result,
    });
  },
);

// getMy chat
const getMyChats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await ChatServices.getChatsByUserIdFromDB(
      req.user,
      req.query,
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Chats retrieved successfully',
      data: result.result,
      pagination: result.pagination,
    });
  },
);

export const ChatController = {
  create1To1Chat,
  createGroupChat,
  updateChat,
  addMemberToChat,
  joinChat,
  leaveChat,
  deleteChat,
  getSingleChat,
  getMyChats,
};
