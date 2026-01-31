import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { JOIN_REQUEST_STATUS } from './joinRequest.constants';
import { IJoinRequest } from './joinRequest.interface';
import { JoinRequest } from './joinRequest.model';
import { Chat } from '../chat/chat.model';

// -------------- create join request --------------
const createJoinRequestIntoDB = async (
  payload: IJoinRequest,
): Promise<IJoinRequest> => {
  // check if chat exists
  const existingChat = await Chat.findById(payload.chat);
  if (!existingChat) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Chat does not exist');
  }

  // check if already a participant of the chat
  if (existingChat.participants.includes(payload.user)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You are already a participant of this chat',
    );
  }

  // check if already a request is pending
  const pendingRequest = await JoinRequest.exists({
    chat: payload.chat,
    user: payload.user,
    status: JOIN_REQUEST_STATUS.PENDING,
  });
  if (pendingRequest) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You already have a pending request for this chat',
    );
  }

  const result = await JoinRequest.create(payload);
  return result;
};

export const JoinRequestServices = {
  createJoinRequestIntoDB,
};
