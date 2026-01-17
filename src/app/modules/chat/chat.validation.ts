import { z } from 'zod';
import { CHAT_ACCESS_TYPE, CHAT_PRIVACY } from './chat.constant';
import { objectId } from '../../../helpers/zodHelper';

// create 1-to-1 chat validation
export const create1to1ChatValidation = z.object({
  body: z
    .object({
      participant: objectId,
    })
    .strict(),
});

// create group chat validation
export const createGroupChatValidation = z.object({
  body: z
    .object({
      participants: z
        .array(objectId)
        .min(1, 'Minimum 1 participants are required'),
      chatName: z.string().nonempty('Chat name cannot be empty'),
      description: z.string().nonempty('Description cannot be empty'),
      privacy: z.nativeEnum(CHAT_PRIVACY),
      accessType: z.nativeEnum(CHAT_ACCESS_TYPE).optional(),
    })
    .strict(),
});

export const ChatValidations = {
  create1to1ChatValidation,
  createGroupChatValidation,
};
