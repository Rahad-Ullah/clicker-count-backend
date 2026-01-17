import { z } from 'zod';
import { MESSAGE_TYPE } from './message.constant';

// Define the validation schema for Message
const createMessageSchema = z.object({
  body: z
    .object({
      chat: z
        .string({ required_error: 'Chat id is required' })
        .nonempty('Chat id is required')
        .length(24, 'Invalid chat id'),
      type: z.nativeEnum(MESSAGE_TYPE),
      content: z
        .string({ required_error: 'Message content is required' })
        .nonempty('Message content is required'),
    })
    .strict(),
});

export const MessageValidations = { createMessageSchema };
