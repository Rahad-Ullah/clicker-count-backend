import express from 'express';
import { ChatController } from './chat.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ChatValidations } from './chat.validation';

const router = express.Router();

// create 1-to-1 chat
router.post(
  '/create-1-to-1',
  auth(),
  validateRequest(ChatValidations.create1to1ChatValidation),
  ChatController.createChat
);

// delete chat
router.delete('/:id', auth(), ChatController.deleteChat);

// get single chat
router.get('/:id', auth(), ChatController.getSingleChat);

// get my chats
router.get('/', auth(), ChatController.getMyChats);

export const ChatRoutes = router;
