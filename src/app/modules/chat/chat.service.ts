import { JwtPayload } from 'jsonwebtoken';
import { IChat } from './chat.interface';
import { Chat } from './chat.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { Message } from '../message/message.model';
import { IMessage } from '../message/message.interface';
import { User } from '../user/user.model';
import { toObjectId } from '../../../util/toObjectId';

// ---------------- create 1-to-1 chat ----------------
export const create1To1ChatIntoDB = async (
  payload: IChat & { participant: string }
) => {
  // 1️. Prevent self-chat
  if (payload.participant === payload.author.toString()) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You cannot create a chat with yourself!'
    );
  }

  // 2️. Check participant existence
  const anotherParticipant = await User.findById(payload.participant).lean();
  if (!anotherParticipant) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Participant does not exist!');
  }

  // 3️. Normalize & sort participants
  const participants = [
    toObjectId(payload.author),
    toObjectId(payload.participant),
  ].sort((a, b) => a.toString().localeCompare(b.toString()));

  // 4️. Check if chat already exists
  const existingChat = await Chat.findOne({
    isGroupChat: false,
    isDeleted: false,
    participants: { $all: participants },
  });

  if (existingChat) {
    return existingChat;
  }

  // 5️. Create new chat
  const chatPayload = {
    ...payload,
    participants,
    chatName: anotherParticipant.name,
    avatarUrl: anotherParticipant.image,
    isGroupChat: false,
  };

  const result = await Chat.create(chatPayload);
  return result;
};

// ---------------- delete chat ----------------
const deleteChatFromDB = async (chatId: string) => {
  const isExist = await Chat.exists({ _id: chatId });
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Chat not found!');
  }

  const result = await Chat.findByIdAndUpdate(
    chatId,
    { isDeleted: true },
    { new: true }
  );
  return result;
};

// ---------------- get single chat by id ----------------
const getSingleChatFromDB = async (chatId: string, userId: string) => {
  const result = await Chat.findById(chatId).populate(
    'participants',
    'name image'
  );

  // check if the user is a participant
  if (
    !result?.participants?.find(
      (participant: any) => participant?._id.toString() === userId
    )
  ) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You are not a participant of this chat!'
    );
  }

  if (result) {
    const anotherParticipant = result?.participants?.find(
      (participant: any) => participant?._id.toString() !== userId
    );
    return { ...result?.toObject(), anotherParticipant };
  }
  return null;
};

// ---------------- get my chats / get by id ----------------
const getMyChatsFromDB = async (
  user: JwtPayload,
  query: Record<string, any>
) => {
  const chats = await Chat.find({ participants: { $in: [user.id] } })
    .populate({
      path: 'participants',
      select: 'name image isDeleted',
      match: {
        // isDeleted: false,
        _id: { $ne: user.id }, // Exclude the current user from the populated participants
        ...(query?.searchTerm && {
          name: { $regex: query?.searchTerm, $options: 'i' },
        }),
      }, // Apply $regex only if search is valid },
    })
    .select('participants updatedAt')
    .sort('-updatedAt');

  // Filter out chats where no participants match the search (empty participants)
  const filteredChats = chats?.filter(
    (chat: any) => chat?.participants?.length > 0
  );

  //Use Promise.all to get the last message for each chat
  const chatList = await Promise.all(
    filteredChats?.map(async (chat: any) => {
      const data = chat?.toObject();

      const lastMessage: IMessage | null = await Message.findOne({
        chat: chat?._id,
      })
        .sort({ createdAt: -1 })
        .select('text image createdAt sender');

      // find unread messages count
      const unreadCount = await Message.countDocuments({
        chat: chat?._id,
        seenBy: { $nin: [user.id] },
      });

      return {
        ...data,
        participants: data.participants,
        unreadCount: unreadCount || 0,
        lastMessage: lastMessage || null,
      };
    })
  );

  return chatList;
};

export const ChatServices = {
  create1To1ChatIntoDB,
  deleteChatFromDB,
  getSingleChatFromDB,
  getMyChatsFromDB,
};
