import colors from 'colors';
import { Server } from 'socket.io';
import { logger } from '../shared/logger';
import { Chat } from '../app/modules/chat/chat.model';
import { socketAuth } from '../app/middlewares/socketAuth';

const socket = (io: Server) => {
  // authenticate by jwt auth middleware
  io.use(socketAuth);

  io.on('connection', socket => {
    const userId = socket.data.userId;

    logger.info(colors.blue(`User connected: ${userId}`));

    // join personal room
    socket.join(`user:${userId}`);

    // join chat room
    socket.on('room:join', async (chatId: string) => {
      if (!chatId || !chatId.match(/^[0-9a-fA-F]{24}$/)) {
        return socket.emit('error', 'Invalid chatId');
      }
      const chat = await Chat.exists({
        _id: chatId,
        isDeleted: false,
        participants: { $in: [userId] },
      });

      if (!chat) {
        return socket.emit(
          'error',
          'Chat not found or you are not a participant of this chat!',
        );
      }

      socket.join(`chat:${chatId}`);
      logger.info(colors.blue(`User:${userId} joined chat:${chatId}`));
    });

    // leave chat
    socket.on('room:leave', (chatId: string) => {
      if (!chatId || !chatId.match(/^[0-9a-fA-F]{24}$/)) {
        return socket.emit('error', 'Invalid chatId');
      }
      socket.leave(`chat:${chatId}`);
    });

    socket.on('disconnect', () => {
      logger.info(colors.red(`User disconnected: ${userId}`));
    });
  });
};

export const socketHelper = { socket };
