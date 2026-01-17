import express from 'express';
import { ChatController } from './chat.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ChatValidations } from './chat.validation';
import { USER_ROLES } from '../user/user.constant';

const router = express.Router();

// create 1-to-1 chat
router.post(
  '/create-1-to-1',
  auth(USER_ROLES.USER, USER_ROLES.ADVERTISER),
  validateRequest(ChatValidations.create1to1ChatValidation),
  ChatController.create1To1Chat,
);

// create group chat
router.post(
  '/create-group',
  auth(USER_ROLES.USER, USER_ROLES.ADVERTISER),
  validateRequest(ChatValidations.createGroupChatValidation),
  ChatController.createGroupChat,
);

// leave chat
router.patch(
  '/leave/:id',
  auth(USER_ROLES.USER, USER_ROLES.ADVERTISER),
  ChatController.leaveChat,
);

// delete chat
router.delete('/:id', auth(), ChatController.deleteChat);

// get single chat
router.get('/:id', auth(), ChatController.getSingleChat);

// get my chats
router.get('/', auth(), ChatController.getMyChats);

export const ChatRoutes = router;
