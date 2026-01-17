import { JwtPayload } from 'jsonwebtoken';
import { IChat } from './chat.interface';
import { Chat } from './chat.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { Message } from '../message/message.model';
import { User } from '../user/user.model';
import { toObjectId } from '../../../util/toObjectId';
import { USER_ROLES, USER_STATUS } from '../user/user.constant';
import { Types } from 'mongoose';
import { CHAT_ACCESS_TYPE, CHAT_PRIVACY } from './chat.constant';
import QueryBuilder from '../../builder/QueryBuilder';

// ---------------- create 1-to-1 chat ----------------
export const create1To1ChatIntoDB = async (
  payload: IChat & { participant: string },
) => {
  // 1️. Prevent self-chat
  if (payload.participant === payload.author.toString()) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You cannot create a chat with yourself!',
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
    isGroupChat: false,
  };

  const result = await Chat.create(chatPayload);
  return result;
};

// ---------------- create group chat ----------------
export const createGroupChatIntoDB = async (payload: IChat) => {
  // 1. push author to participants if not exist
  if (!payload.participants.includes(payload.author)) {
    payload.participants.push(payload.author);
  }

  // 2. check participant existence
  const validParticipants = await User.find({
    _id: { $in: payload.participants },
  })
    .select('_id')
    .lean();
  if (validParticipants.length !== payload.participants.length) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Invalid participant provided!');
  }

  // 3. create new chat
  const chatPayload = {
    ...payload,
    isGroupChat: true,
  };
  const result = await Chat.create(chatPayload);
  return result;
};

// ---------------- join chat ----------------

const joinChatIntoDB = async (chatId: string, userId: string) => {
  // 1️. Validate user exists
  const userExists = await User.exists({
    _id: userId,
    isDeleted: false,
    status: USER_STATUS.ACTIVE,
  });
  if (!userExists) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'User does not exist or not active!',
    );
  }

  // 2️. Fetch chat
  const chat = await Chat.findOne({ _id: chatId, isDeleted: false });
  if (!chat) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Chat not found!');
  }

  // 3️. Prevent joining 1-to-1 chat
  if (!chat.isGroupChat) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You cannot join a 1-to-1 chat!',
    );
  }

  // 4️. Already a participant
  if (chat.participants.some(p => p.equals(userId))) {
    return chat;
  }

  // 5️. Join chat with access control
  if (chat.accessType === CHAT_ACCESS_TYPE.RESTRICTED) {
    // ! todo: create a join request
    return;
  }
  // join directly for public groups
  const result = await Chat.findByIdAndUpdate(
    chatId,
    { $addToSet: { participants: new Types.ObjectId(userId) } },
    { new: true },
  );

  return result;
};

// ---------------- leave chat ----------------
const leaveChatFromDB = async (chatId: string, userId: string) => {
  // check if the chat exists
  const chat = await Chat.findOne({ _id: chatId, isDeleted: false });
  if (!chat) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Chat not found!');
  }

  // Prevent leaving 1-to-1 chat
  if (!chat.isGroupChat) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You cannot leave a 1-to-1 chat!',
    );
  }

  // check if the user is a participant
  const isParticipant = chat.participants.some(p => p.equals(userId));
  if (!isParticipant) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You are not a participant of this chat!',
    );
  }

  // delete the chat if there is only one participant
  if (chat.participants.length === 1) {
    await Chat.findByIdAndUpdate(chatId, { isDeleted: true });
  }

  const result = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { participants: new Types.ObjectId(userId) } },
    { new: true },
  );

  return result;
};

// ---------------- delete chat ----------------
const deleteChatFromDB = async (chatId: string, user: JwtPayload) => {
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Chat not found!');
  }

  const isAdmin =
    user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.SUPER_ADMIN;

  const isAuthor = chat.author.equals(user.id);
  const isParticipant = chat.participants.some(p => p.equals(user.id));

  // Authorization for non-admin
  if (!isAdmin) {
    // Group chat
    if (chat.isGroupChat) {
      if (!isAuthor) {
        throw new ApiError(
          StatusCodes.UNAUTHORIZED,
          'You are not authorized to delete this chat!',
        );
      }
    } else {
      // 1-to-1 chat
      if (!isParticipant) {
        throw new ApiError(
          StatusCodes.UNAUTHORIZED,
          'You are not authorized to delete this chat!',
        );
      }
    }
  }

  const result = await Chat.findByIdAndUpdate(
    chatId,
    { isDeleted: true },
    { new: true },
  );

  return result;
};

// ---------------- get single chat by id ----------------
const getSingleChatFromDB = async (chatId: string, currentUserId: string) => {
  const chat = await Chat.findById(chatId)
    .populate('participants', 'name image')
    .populate('latestMessage')
    .lean();

  if (!chat) {
    return null;
  }

  // check if the user is a participant of the chat
  const isParticipant = chat.participants.some((p: any) =>
    p._id.equals(currentUserId),
  );
  if (!isParticipant) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You are not a participant of this chat!',
    );
  }

  if (!chat.isGroupChat) {
    const anotherParticipant = chat.participants.find(
      (p: any) => p._id.toString() !== currentUserId,
    );

    const { participants, ...restChat } = chat;

    return {
      ...restChat,
      anotherParticipant,
    };
  }

  return chat;
};

// ---------------- get by user id ----------------
const getChatsByUserIdFromDB = async (
  user: JwtPayload,
  query: Record<string, unknown>,
) => {
  const searchTerm = (query.searchTerm as string)?.trim();
  const filter: any = { isDeleted: false, participants: user.id };

  if (searchTerm && query.isGroupChat === 'true') {
    delete filter.participants;
    filter.privacy = CHAT_PRIVACY.PUBLIC;
    filter.$or = [{ name: { $regex: searchTerm, $options: 'i' } }];
  }

  // 1️. Base query
  const chatQuery = new QueryBuilder(
    Chat.find(filter)
      .populate({
        path: 'participants',
        select: 'name image',
        match: {
          // _id: { $ne: user.id },
          ...(searchTerm &&
            !filter.isGroupChat && {
              name: { $regex: searchTerm, $options: 'i' },
            }),
        },
      })
      .populate({
        path: 'latestMessage',
        populate: {
          path: 'sender',
          select: 'name image',
        },
      }),
    query,
  )
    .filter()
    .sort() // default: -updatedAt
    .fields()
    .paginate();

  // 2️. Execute query + pagination info
  const [chats, pagination] = await Promise.all([
    chatQuery.modelQuery.lean(),
    chatQuery.getPaginationInfo(),
  ]);

  // 3️. Remove chats where search filtered out participants
  const filteredChats = chats.filter(
    (chat: any) => chat.participants && chat.participants.length > 0,
  );

  // 4️. Unread counts (only paginated chats)
  const unreadCounts = await Message.aggregate([
    {
      $match: {
        chat: { $in: filteredChats.map(c => c._id) },
        seenBy: { $nin: [user.id] },
      },
    },
    {
      $group: {
        _id: '$chat',
        count: { $sum: 1 },
      },
    },
  ]);

  const unreadMap = new Map(unreadCounts.map(u => [u._id.toString(), u.count]));

  // 5️⃣ Format response (1-to-1 vs group)
  const data = filteredChats.map((chat: any) => {
    const unreadCount = unreadMap.get(chat._id.toString()) || 0;

    if (!chat.isGroupChat) {
      const anotherParticipant = chat.participants[0];
      const { participants, ...rest } = chat;

      return {
        ...rest,
        anotherParticipant,
        unreadCount,
      };
    }

    return { ...chat, unreadCount };
  });

  return {
    result: data,
    pagination,
  };
};

export const ChatServices = {
  create1To1ChatIntoDB,
  createGroupChatIntoDB,
  joinChatIntoDB,
  leaveChatFromDB,
  deleteChatFromDB,
  getSingleChatFromDB,
  getChatsByUserIdFromDB,
};
