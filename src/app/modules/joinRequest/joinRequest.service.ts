import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { JOIN_REQUEST_STATUS } from './joinRequest.constants';
import { IJoinRequest } from './joinRequest.interface';
import { JoinRequest } from './joinRequest.model';
import { Chat } from '../chat/chat.model';
import mongoose from 'mongoose';
import { CHAT_ACCESS_TYPE } from '../chat/chat.constant';
import QueryBuilder from '../../builder/QueryBuilder';

// -------------- create join request --------------
const createJoinRequestIntoDB = async (payload: IJoinRequest) => {
  // check if chat exists
  const existingChat = await Chat.findById(payload.chat);
  if (!existingChat) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Chat does not exist');
  }

  // check if already a participant of the chat
  if (existingChat.participants.some(p => p.equals(payload.user))) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You are already a participant of this chat',
    );
  }

  // if the chat is public then direct join to the chat
  if (existingChat.accessType === CHAT_ACCESS_TYPE.OPEN) {
    await Chat.findByIdAndUpdate(payload.chat, {
      $addToSet: {
        participants: payload.user,
      },
    });

    return { message: 'Joined the chat successfully' };
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

// -------------- update join request --------------
const updateJoinRequestIntoDB = async (
  id: string,
  payload: Partial<IJoinRequest>,
): Promise<IJoinRequest> => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Fetch join request inside session
    const joinRequest = await JoinRequest.findById(id).session(session);

    if (!joinRequest) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Join request not found');
    }

    if (joinRequest.status !== JOIN_REQUEST_STATUS.PENDING) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Only pending join requests can be updated',
      );
    }

    //  If accepted, add participant to chat
    if (payload.status === JOIN_REQUEST_STATUS.ACCEPTED) {
      await Chat.findByIdAndUpdate(
        joinRequest.chat,
        { $addToSet: { participants: joinRequest.user } },
        { session },
      );
    }

    //  Update join request
    const result = await JoinRequest.findByIdAndUpdate(id, payload, {
      new: true,
      session,
    });

    await session.commitTransaction();
    return result!;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// -------------- get pending request by chat id --------------
const getPendingRequestByChatId = async (
  chatId: string,
  query: Record<string, any>,
) => {
  const requestQuery = new QueryBuilder(
    JoinRequest.find({ chat: chatId, status: JOIN_REQUEST_STATUS.PENDING }),
    query,
  )
    .sort()
    .fields()
    .paginate();

  const [data, pagination] = await Promise.all([
    requestQuery.modelQuery.lean(),
    requestQuery.getPaginationInfo(),
  ]);

  return {
    data,
    pagination,
  };
};

export const JoinRequestServices = {
  createJoinRequestIntoDB,
  updateJoinRequestIntoDB,
  getPendingRequestByChatId,
};
