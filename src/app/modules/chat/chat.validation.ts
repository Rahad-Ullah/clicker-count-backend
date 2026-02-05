import { z } from 'zod';
import {
  CHAT_ACCESS_TYPE,
  CHAT_PRIVACY,
  REQUEST_STATUS,
} from './chat.constant';
import { objectId } from '../../../helpers/zodHelper';

// create 1-to-1 chat validation
const create1to1ChatValidation = z.object({
  body: z
    .object({
      participant: objectId('Invalid participant ID'),
    })
    .strict(),
});

// create group chat validation
const createGroupChatValidation = z.object({
  body: z
    .object({
      participants: z
        .array(objectId('Invalid participant ID'))
        .min(1, 'Minimum 1 participants are required'),
      chatName: z.string().nonempty('Chat name cannot be empty'),
      description: z.string().nonempty('Description cannot be empty'),
      privacy: z.nativeEnum(CHAT_PRIVACY),
      accessType: z.nativeEnum(CHAT_ACCESS_TYPE).optional(),
    })
    .strict(),
});

// update chat validation
const updateChatValidation = z.object({
  params: z.object({
    id: objectId('Invalid chat ID'),
  }),
  body: z
    .object({
      chatName: z.string().nonempty('Chat name cannot be empty').optional(),
      description: z
        .string()
        .nonempty('Description cannot be empty')
        .optional(),
      privacy: z.nativeEnum(CHAT_PRIVACY).optional(),
      accessType: z.nativeEnum(CHAT_ACCESS_TYPE).optional(),
      requestStatus: z
        .enum([REQUEST_STATUS.ACCEPTED, REQUEST_STATUS.REJECTED])
        .optional(),
      image: z.any().optional(),
    })
    .strict(),
});

// add member to chat
const addMemberToChatValidation = z.object({
  params: z.object({
    id: objectId('Invalid chat ID'),
  }),
  body: z
    .object({
      members: z
        .array(objectId('Invalid participant ID'))
        .min(1, 'Minimum 1 participants are required'),
    })
    .strict(),
})

// remove member from chat
const removeMemberFromChatValidation = z.object({
  params: z.object({
    id: objectId('Invalid chat ID'),
  }),
  body: z
    .object({
      member: objectId('Invalid participant ID'),
    })
    .strict(),
})

// send greetings
const sendGreetingsToUserValidation = z.object({
  body: z
    .object({
      user: objectId('Invalid user ID'),
      text: z.string().nonempty('Message content is required'),
    })
    .strict(),
})

export const ChatValidations = {
  create1to1ChatValidation,
  createGroupChatValidation,
  updateChatValidation,
  addMemberToChatValidation,
  removeMemberFromChatValidation,
  sendGreetingsToUserValidation
};
