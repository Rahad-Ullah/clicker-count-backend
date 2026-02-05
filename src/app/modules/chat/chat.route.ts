import express from 'express';
import { ChatController } from './chat.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ChatValidations } from './chat.validation';
import { USER_ROLES } from '../user/user.constant';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

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

// update chat
router.patch(
  '/update/:id',
  auth(USER_ROLES.USER, USER_ROLES.ADVERTISER),
  fileUploadHandler(),
  validateRequest(ChatValidations.updateChatValidation),
  ChatController.updateChat,
);

// add member to chat
router.patch(
  '/add-member/:id',
  auth(USER_ROLES.USER, USER_ROLES.ADVERTISER),
  validateRequest(ChatValidations.addMemberToChatValidation),
  ChatController.addMemberToChat,
);

// remove member from chat
router.patch(
  '/remove-member/:id',
  auth(USER_ROLES.USER, USER_ROLES.ADVERTISER),
  validateRequest(ChatValidations.removeMemberFromChatValidation),
  ChatController.removeMemberFromChat,
);

// join chat
router.patch(
  '/join/:id',
  auth(USER_ROLES.USER, USER_ROLES.ADVERTISER),
  ChatController.joinChat,
);

// leave chat
router.patch(
  '/leave/:id',
  auth(USER_ROLES.USER, USER_ROLES.ADVERTISER),
  ChatController.leaveChat,
);

// send greetings
router.post(
  '/send-greetings',
  auth(USER_ROLES.USER, USER_ROLES.ADVERTISER),
  validateRequest(ChatValidations.sendGreetingsToUserValidation),
  ChatController.sendGreetingsToUser,
);

// delete chat
router.delete('/:id', auth(), ChatController.deleteChat);

// get single chat
router.get('/single/:id', auth(), ChatController.getSingleChat);

// get my chats
router.get('/my-chats', auth(), ChatController.getMyChats);

export const ChatRoutes = router;
