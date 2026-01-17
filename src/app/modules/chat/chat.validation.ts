import { z } from 'zod';
import { CHAT_ACCESS_TYPE, CHAT_PRIVACY } from './chat.constant';

// create 1-to-1 chat validation
export const createChatValidation = z.object({
  body: z
    .object({
      participants: z
        .array(
          z
            .string({ required_error: 'Participant id are required' })
            .length(24, 'Invalid participant id')
            .nonempty('Participant id cannot be empty')
        )
        .min(1, 'Minimum 1 participants are required'),
    })
    .strict(),
});

// create group chat validation
export const createGroupChatValidation = z.object({
  body: z
    .object({
      participants: z
        .array(
          z
            .string({ required_error: 'Participant id are required' })
            .length(24, 'Invalid participant id')
            .nonempty('Participant id cannot be empty')
        )
        .min(1, 'Minimum 1 participants are required'),
      chatName: z.string().nonempty('Chat name cannot be empty'),
      description: z.string().nonempty('Description cannot be empty'),
      privacy: z.nativeEnum(CHAT_PRIVACY),
      accessType: z.nativeEnum(CHAT_ACCESS_TYPE).optional(),
    })
    .strict(),
});

export const ChatValidations = {
  createChatValidation,
  createGroupChatValidation,
};
